import type { Project, PoleLabels } from '../types';
import { cartesianToBary, getHeatLevel, getHeatAdvice, VERTEX_COLORS } from '../utils/triangle';

interface AnalysisPanelProps {
  project: Project;
  poleLabels: PoleLabels;
}

export default function AnalysisPanel({ project, poleLabels }: AnalysisPanelProps) {
  const bary = cartesianToBary(project.x, project.y);
  const heat = getHeatLevel(project.x, project.y);
  const advice = getHeatAdvice(heat.level);

  const meters = [
    { label: poleLabels.eg.name, value: bary.eg, color: VERTEX_COLORS.eg },
    { label: poleLabels.zu.name, value: bary.zu, color: VERTEX_COLORS.zu },
    { label: poleLabels.st.name, value: bary.st, color: VERTEX_COLORS.st },
  ];

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header with project name and heat badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {project.name}
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: 4,
            backgroundColor: heat.color + '22',
            color: heat.color,
            whiteSpace: 'nowrap',
          }}
        >
          {heat.level}
        </span>
      </div>

      {/* Meter bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meters.map((m) => (
          <div key={m.label}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 11,
                color: 'var(--text-secondary)',
                marginBottom: 4,
              }}
            >
              <span>{m.label}</span>
              <span>{m.value}%</span>
            </div>
            <div
              style={{
                height: 6,
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.max(0, Math.min(100, m.value))}%`,
                  backgroundColor: m.color,
                  borderRadius: 3,
                  transition: 'width 150ms ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Advice text */}
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
        {advice}
      </div>
    </div>
  );
}
