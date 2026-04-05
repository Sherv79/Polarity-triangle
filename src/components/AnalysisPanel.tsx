import type { Project, PoleLabels } from '../types';
import { cartesianToBary, getHeatLevel, getHeatAdvice, VERTEX_COLORS } from '../utils/triangle';

interface AnalysisPanelProps {
  project: Project;
  poleLabels: PoleLabels;
}

function MeterBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 11,
          color: 'var(--text-secondary)',
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
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
            width: `${Math.max(0, Math.min(100, value))}%`,
            backgroundColor: color,
            borderRadius: 3,
            transition: 'width 150ms ease',
          }}
        />
      </div>
    </div>
  );
}

function HeatBadge({ level, color }: { level: string; color: string }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 4,
        backgroundColor: color + '22',
        color: color,
        whiteSpace: 'nowrap',
      }}
    >
      {level}
    </span>
  );
}

function getDominantPole(eg: number, zu: number, st: number, labels: PoleLabels): string {
  if (eg >= zu && eg >= st) return labels.eg.name;
  if (zu >= eg && zu >= st) return labels.zu.name;
  return labels.st.name;
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

  const ai = project.aiPosition;
  const aiHeat = ai ? getHeatLevel(ai.x, ai.y) : null;

  const aiMeters = ai
    ? [
        { label: poleLabels.eg.name, value: ai.eg, color: VERTEX_COLORS.eg },
        { label: poleLabels.zu.name, value: ai.zu, color: VERTEX_COLORS.zu },
        { label: poleLabels.st.name, value: ai.st, color: VERTEX_COLORS.st },
      ]
    : null;

  // Diff text
  let diffText: string | null = null;
  if (ai) {
    const manualDominant = getDominantPole(bary.eg, bary.zu, bary.st, poleLabels);
    const aiDominant = getDominantPole(ai.eg, ai.zu, ai.st, poleLabels);
    if (manualDominant === aiDominant) {
      diffText =
        'Ihre Einschätzung und die KI-Analyse stimmen in der dominanten Paradoxie überein.';
    } else {
      diffText = `Interessante Abweichung: Sie gewichten ${manualDominant} am stärksten, die KI-Analyse sieht ${aiDominant} als dominanter. Das kann ein guter Ausgangspunkt für die Diskussion sein.`;
    }
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {project.name}
        </div>
        <HeatBadge level={heat.level} color={heat.color} />
      </div>

      {/* Manual meters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {meters.map((m) => (
          <MeterBar key={m.label} {...m} />
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{advice}</div>

      {/* AI section */}
      {ai && aiMeters && aiHeat && (
        <>
          <div
            style={{
              borderTop: '1px solid var(--border)',
              margin: '4px 0',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
              KI-Einschätzung
            </div>
            <HeatBadge level={aiHeat.level} color={aiHeat.color} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {aiMeters.map((m) => (
              <MeterBar key={`ai-${m.label}`} {...m} />
            ))}
          </div>

          {diffText && (
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              {diffText}
            </div>
          )}
        </>
      )}
    </div>
  );
}
