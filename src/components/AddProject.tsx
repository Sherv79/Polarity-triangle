import { useState } from 'react';
import { PROJECT_COLORS } from '../utils/triangle';

interface AddProjectProps {
  onAdd: (name: string, color: string) => void;
  onClearAll: () => void;
  nextColorIndex: number;
  hasProjects: boolean;
}

export default function AddProject({ onAdd, onClearAll, nextColorIndex, hasProjects }: AddProjectProps) {
  const [name, setName] = useState('');
  const [colorIdx, setColorIdx] = useState(nextColorIndex);

  // Keep color in sync with parent rotation
  const effectiveIdx = colorIdx % PROJECT_COLORS.length;

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, PROJECT_COLORS[effectiveIdx]);
    setName('');
    setColorIdx((effectiveIdx + 1) % PROJECT_COLORS.length);
  };

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
        Projekt hinzufügen
      </div>

      <input
        type="text"
        placeholder="Projektname eingeben..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit();
        }}
      />

      {/* Color picker */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {PROJECT_COLORS.map((c, i) => (
          <button
            key={c}
            onClick={() => setColorIdx(i)}
            style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: c,
              border: i === effectiveIdx ? '2px solid var(--text-primary)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'border-color 150ms ease',
              padding: 0,
            }}
            aria-label={`Farbe ${i + 1}`}
          />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={!name.trim()} style={{ flex: 1 }}>
          Platzieren
        </button>
        {hasProjects && (
          <button className="btn-danger" onClick={onClearAll}>
            Alle entfernen
          </button>
        )}
      </div>
    </div>
  );
}
