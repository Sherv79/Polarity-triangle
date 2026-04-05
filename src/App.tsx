import { useState, useCallback, useRef } from 'react';
import type { Project, PoleLabels, ChatMessage, AiPosition } from './types';
import { PROJECT_COLORS } from './utils/triangle';
import Header from './components/Header';
import Footer from './components/Footer';
import Triangle from './components/Triangle';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import AnalysisPanel from './components/AnalysisPanel';
import ChatPanel from './components/ChatPanel';
import IntroOverlay from './components/IntroOverlay';

const DEFAULT_POLE_LABELS: PoleLabels = {
  eg: { name: 'Entscheidungsgrundlagen', subtitle: 'Worauf stützen wir Entscheidungen?' },
  zu: { name: 'Zurechnung', subtitle: 'Wer steht für das Ergebnis ein?' },
  st: { name: 'Steuerbarkeit', subtitle: 'Bleibt die Lernfähigkeit erhalten?' },
};

let nextId = 1;

// Resolve CSS variables to actual color values for SVG export
function resolveVar(varStr: string): string {
  if (!varStr.startsWith('var(')) return varStr;
  const name = varStr.replace(/^var\(/, '').replace(/\)$/, '');
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || varStr;
}

function resolveCssVarsInSvg(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const allEls = clone.querySelectorAll('*');

  const varProps = ['fill', 'stroke', 'color'];
  const resolve = (val: string) => {
    if (!val) return val;
    return val.replace(/var\(--[^)]+\)/g, (m) => resolveVar(m));
  };

  allEls.forEach((el) => {
    varProps.forEach((prop) => {
      const attr = el.getAttribute(prop);
      if (attr && attr.includes('var(')) {
        el.setAttribute(prop, resolve(attr));
      }
    });
    // Also resolve inline styles
    const style = el.getAttribute('style');
    if (style && style.includes('var(')) {
      el.setAttribute('style', resolve(style));
    }
  });

  // Remove foreignObject elements (editable label inputs don't render on canvas)
  clone.querySelectorAll('foreignObject').forEach((fo) => fo.remove());

  return clone;
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [poleLabels, setPoleLabels] = useState<PoleLabels>(DEFAULT_POLE_LABELS);
  const [toast, setToast] = useState<{ text: string; phase: 'enter' | 'visible' | 'exit' } | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const waitingProject = projects.find((p) => p.status === 'waiting');
  const selectedProject = projects.find((p) => p.id === selectedId && p.status === 'placed');

  const showToast = useCallback((text: string) => {
    setToast({ text, phase: 'enter' });
    requestAnimationFrame(() => {
      setToast({ text, phase: 'visible' });
    });
    setTimeout(() => {
      setToast((t) => (t ? { ...t, phase: 'exit' } : null));
      setTimeout(() => setToast(null), 300);
    }, 3000);
  }, []);

  const handleAdd = useCallback((name: string, color: string) => {
    const id = `p-${nextId}`;
    const number = nextId++;
    setProjects((prev) => [
      ...prev.filter((p) => p.status !== 'waiting'),
      { id, name, color, number, x: 0, y: 0, status: 'waiting', aiPosition: null, chatMessages: [] },
    ]);
    setColorIndex((i) => (i + 1) % PROJECT_COLORS.length);
  }, []);

  const handlePlace = useCallback((id: string, x: number, y: number) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y, status: 'placed' as const } : p))
    );
    setSelectedId(id);
  }, []);

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, x, y } : p)));
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      setProjects((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [selectedId]
  );

  const handleClearAll = useCallback(() => {
    setProjects([]);
    setSelectedId(null);
  }, []);

  const handleChatMessagesChange = useCallback((projectId: string, messages: ChatMessage[]) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, chatMessages: messages } : p))
    );
  }, []);

  const handleAiAnalysis = useCallback((projectId: string, position: AiPosition) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, aiPosition: position } : p))
    );
    showToast('KI-Einschätzung wurde im Dreieck platziert');
  }, [showToast]);

  const handleChatReset = useCallback((projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, chatMessages: [], aiPosition: null } : p))
    );
  }, []);

  const handleExportPng = useCallback(() => {
    const svgEl = svgContainerRef.current?.querySelector('svg');
    if (!svgEl) return;

    const resolved = resolveCssVarsInSvg(svgEl);
    resolved.setAttribute('width', '1360');
    resolved.setAttribute('height', '1080');
    resolved.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Add font + background
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
    `;
    resolved.insertBefore(style, resolved.firstChild);

    // Add background rect
    const bgColor = resolveVar('var(--bg-primary)');
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '100%');
    bg.setAttribute('height', '100%');
    bg.setAttribute('fill', bgColor);
    resolved.insertBefore(bg, resolved.firstChild);

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(resolved);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1360;
      canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = 'Polarity-Dreieck.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  }, []);

  return (
    <>
      <Header onExportPng={handleExportPng} />
      <main
        style={{
          flex: 1,
          display: 'flex',
          gap: 24,
          padding: 24,
          minHeight: 0,
        }}
      >
        {/* Triangle area */}
        <div
          ref={svgContainerRef}
          style={{ flex: '0 0 60%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}
          className="triangle-area"
        >
          {toast && (
            <div
              className={`toast-${toast.phase}`}
              style={{
                position: 'absolute',
                top: 12,
                left: '50%',
                transform: `translateX(-50%)${toast.phase === 'enter' || toast.phase === 'exit' ? ' translateY(-8px)' : ''}`,
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 16px',
                fontSize: 12,
                zIndex: 10,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {toast.text}
            </div>
          )}
          <Triangle
            projects={projects}
            selectedId={selectedId}
            waitingId={waitingProject?.id ?? null}
            poleLabels={poleLabels}
            onPlaceProject={handlePlace}
            onSelectProject={setSelectedId}
            onMoveProject={handleMove}
            onPoleLabelsChange={setPoleLabels}
          />
        </div>

        {/* Sidebar */}
        <div
          style={{ flex: '0 0 calc(40% - 24px)', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}
          className="sidebar-area"
        >
          <AddProject
            onAdd={handleAdd}
            onClearAll={handleClearAll}
            nextColorIndex={colorIndex}
            hasProjects={projects.some((p) => p.status === 'placed')}
          />
          <ProjectList
            projects={projects}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={handleDelete}
          />
          {selectedProject && <AnalysisPanel project={selectedProject} poleLabels={poleLabels} />}
          <ChatPanel
            projectId={selectedProject?.id ?? null}
            projectName={selectedProject?.name ?? null}
            messages={selectedProject?.chatMessages ?? []}
            onMessagesChange={handleChatMessagesChange}
            onAiAnalysis={handleAiAnalysis}
            onReset={handleChatReset}
          />
        </div>
      </main>
      <Footer />
      <IntroOverlay />

      <style>{`
        @media (max-width: 768px) {
          main {
            flex-direction: column !important;
          }
          .triangle-area {
            flex: 1 1 auto !important;
          }
          .sidebar-area {
            flex: 1 1 auto !important;
          }
        }
      `}</style>
    </>
  );
}
