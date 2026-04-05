import { useState, useCallback } from 'react';
import type { Project } from './types';
import { PROJECT_COLORS } from './utils/triangle';
import Header from './components/Header';
import Footer from './components/Footer';
import Triangle from './components/Triangle';
import AddProject from './components/AddProject';
import ProjectList from './components/ProjectList';
import AnalysisPanel from './components/AnalysisPanel';

let nextId = 1;

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [colorIndex, setColorIndex] = useState(0);

  // The "waiting" project is one that has been created but not yet placed
  const waitingProject = projects.find((p) => p.status === 'waiting');

  const handleAdd = useCallback((name: string, color: string) => {
    const id = `p-${nextId}`;
    const number = nextId++;
    setProjects((prev) => [
      // Remove any existing waiting project
      ...prev.filter((p) => p.status !== 'waiting'),
      { id, name, color, number, x: 0, y: 0, status: 'waiting' },
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

  const selectedProject = projects.find((p) => p.id === selectedId && p.status === 'placed');

  return (
    <>
      <Header />
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
          style={{ flex: '0 0 60%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="triangle-area"
        >
          <Triangle
            projects={projects}
            selectedId={selectedId}
            waitingId={waitingProject?.id ?? null}
            onPlaceProject={handlePlace}
            onSelectProject={setSelectedId}
            onMoveProject={handleMove}
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
          {selectedProject && <AnalysisPanel project={selectedProject} />}
        </div>
      </main>
      <Footer />

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
