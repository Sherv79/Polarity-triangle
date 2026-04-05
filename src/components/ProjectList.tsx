import type { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProjectList({ projects, selectedId, onSelect, onDelete }: ProjectListProps) {
  const placed = projects.filter((p) => p.status === 'placed');

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
        Projekte
      </div>

      {placed.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', padding: '8px 0' }}>
          Noch keine Projekte platziert.
        </div>
      ) : (
        <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {placed.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelect(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                cursor: 'pointer',
                backgroundColor: p.id === selectedId ? 'var(--bg-tertiary)' : 'transparent',
                transition: 'background-color 150ms ease',
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: p.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', flexShrink: 0 }}>
                {p.number}.
              </span>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(p.id);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: 14,
                  lineHeight: 1,
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E24B4A')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
                aria-label={`${p.name} entfernen`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
