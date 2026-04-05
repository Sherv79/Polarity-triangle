import { useCallback, useRef } from 'react';
import type { Project, PoleLabels } from '../types';
import { VERTICES, VERTEX_COLORS, HEAT_ZONES, isPointInTriangle } from '../utils/triangle';
import EditableLabel from './EditableLabel';

interface TriangleProps {
  projects: Project[];
  selectedId: string | null;
  waitingId: string | null;
  poleLabels: PoleLabels;
  onPlaceProject: (id: string, x: number, y: number) => void;
  onSelectProject: (id: string | null) => void;
  onMoveProject: (id: string, x: number, y: number) => void;
  onPoleLabelsChange: (labels: PoleLabels) => void;
}

export default function Triangle({
  projects,
  selectedId,
  waitingId,
  poleLabels,
  onPlaceProject,
  onSelectProject,
  onMoveProject,
  onPoleLabelsChange,
}: TriangleProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const draggingRef = useRef<string | null>(null);

  const toLocal = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.querySelector<SVGGElement>('#triangle-group')?.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (draggingRef.current) return;
      const { x, y } = toLocal(e.clientX, e.clientY);

      const clicked = projects.find(
        (p) => p.status === 'placed' && Math.hypot(p.x - x, p.y - y) < 20
      );
      if (clicked) {
        onSelectProject(clicked.id);
        return;
      }

      if (waitingId && isPointInTriangle(x, y)) {
        onPlaceProject(waitingId, x, y);
        return;
      }

      onSelectProject(null);
    },
    [projects, waitingId, toLocal, onPlaceProject, onSelectProject]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, projectId: string) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as SVGElement).setPointerCapture(e.pointerId);
      draggingRef.current = projectId;
      onSelectProject(projectId);
    },
    [onSelectProject]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!draggingRef.current) return;
      const { x, y } = toLocal(e.clientX, e.clientY);
      if (isPointInTriangle(x, y)) {
        onMoveProject(draggingRef.current, x, y);
      }
    },
    [toLocal, onMoveProject]
  );

  const handlePointerUp = useCallback(() => {
    draggingRef.current = null;
  }, []);

  const updateLabel = (pole: keyof PoleLabels, field: 'name' | 'subtitle', value: string) => {
    onPoleLabelsChange({
      ...poleLabels,
      [pole]: { ...poleLabels[pole], [field]: value },
    });
  };

  const placedProjects = projects.filter((p) => p.status === 'placed');

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 680 540"
      style={{
        width: '100%',
        maxHeight: '75vh',
        cursor: waitingId ? 'crosshair' : 'default',
        userSelect: 'none',
      }}
      onClick={handleClick}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <g id="triangle-group" transform="translate(340, 260)">
        {/* Heat zones */}
        {HEAT_ZONES.map((zone) => (
          <circle
            key={zone.radius}
            cx={0}
            cy={10}
            r={zone.radius}
            fill={zone.color}
            opacity={zone.opacity}
          />
        ))}

        {/* Main triangle */}
        <polygon
          points={`${VERTICES.A.x},${VERTICES.A.y} ${VERTICES.B.x},${VERTICES.B.y} ${VERTICES.C.x},${VERTICES.C.y}`}
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
        />

        {/* Inner orientation triangles (dashed) */}
        <polygon
          points="0,-140 161,81 -161,81"
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.8"
          strokeDasharray="6 4"
          opacity={0.5}
        />
        <polygon
          points="0,-70 81,40 -81,40"
          fill="none"
          stroke="var(--border)"
          strokeWidth="0.8"
          strokeDasharray="4 4"
          opacity={0.35}
        />

        {/* Axis lines from centroid to vertices */}
        {[VERTICES.A, VERTICES.B, VERTICES.C].map((v, i) => (
          <line
            key={i}
            x1={0}
            y1={10}
            x2={v.x}
            y2={v.y}
            stroke="var(--border)"
            strokeWidth="0.5"
            opacity={0.3}
          />
        ))}

        {/* Center label */}
        <text
          x={0}
          y={16}
          textAnchor="middle"
          fontSize={10}
          fill="#E24B4A"
          opacity={0.5}
          fontWeight={500}
        >
          Maximale Herausforderung
        </text>

        {/* Vertex labels — editable */}
        {/* Top: Entscheidungsgrundlagen */}
        <circle cx={VERTICES.A.x} cy={VERTICES.A.y} r={5} fill={VERTEX_COLORS.eg} />
        <EditableLabel
          x={VERTICES.A.x}
          y={VERTICES.A.y - 20}
          text={poleLabels.eg.name}
          onChange={(v) => updateLabel('eg', 'name', v)}
          fontSize={12}
          fontWeight={600}
          fill={VERTEX_COLORS.eg}
        />
        <EditableLabel
          x={VERTICES.A.x}
          y={VERTICES.A.y - 6}
          text={poleLabels.eg.subtitle}
          onChange={(v) => updateLabel('eg', 'subtitle', v)}
          fontSize={9}
          fill="var(--text-tertiary)"
          width={240}
        />

        {/* Bottom-right: Zurechnung */}
        <circle cx={VERTICES.B.x} cy={VERTICES.B.y} r={5} fill={VERTEX_COLORS.zu} />
        <EditableLabel
          x={VERTICES.B.x}
          y={VERTICES.B.y + 28}
          text={poleLabels.zu.name}
          onChange={(v) => updateLabel('zu', 'name', v)}
          fontSize={12}
          fontWeight={600}
          fill={VERTEX_COLORS.zu}
        />
        <EditableLabel
          x={VERTICES.B.x}
          y={VERTICES.B.y + 42}
          text={poleLabels.zu.subtitle}
          onChange={(v) => updateLabel('zu', 'subtitle', v)}
          fontSize={9}
          fill="var(--text-tertiary)"
          width={240}
        />

        {/* Bottom-left: Steuerbarkeit */}
        <circle cx={VERTICES.C.x} cy={VERTICES.C.y} r={5} fill={VERTEX_COLORS.st} />
        <EditableLabel
          x={VERTICES.C.x}
          y={VERTICES.C.y + 28}
          text={poleLabels.st.name}
          onChange={(v) => updateLabel('st', 'name', v)}
          fontSize={12}
          fontWeight={600}
          fill={VERTEX_COLORS.st}
        />
        <EditableLabel
          x={VERTICES.C.x}
          y={VERTICES.C.y + 42}
          text={poleLabels.st.subtitle}
          onChange={(v) => updateLabel('st', 'subtitle', v)}
          fontSize={9}
          fill="var(--text-tertiary)"
          width={240}
        />

        {/* Project dots */}
        {placedProjects.map((p) => {
          const isSelected = p.id === selectedId;
          const r = isSelected ? 18 : 15;
          return (
            <g
              key={p.id}
              style={{ cursor: 'grab' }}
              onPointerDown={(e) => handlePointerDown(e, p.id)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={r}
                fill={p.color}
                opacity={isSelected ? 0.9 : 0.8}
                stroke="#FFFFFF"
                strokeWidth={isSelected ? 2.5 : 2}
              />
              <text
                x={p.x}
                y={p.y + 4.5}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                fill="#FFFFFF"
                pointerEvents="none"
              >
                {p.number}
              </text>
              <text
                x={p.x + r + 6}
                y={p.y + 4}
                fontSize={11}
                fill="var(--text-secondary)"
                pointerEvents="none"
              >
                {p.name}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
