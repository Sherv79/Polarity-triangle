import { useState, useEffect } from 'react';

const STORAGE_KEY = 'intro_seen';

export default function IntroOverlay() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="overlay-backdrop" onClick={dismiss}>
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          padding: 28,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
          So funktioniert das Polarity-Dreieck
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { n: '1', text: 'Geben Sie einen Projektnamen ein und klicken Sie „Platzieren"' },
            { n: '2', text: 'Klicken Sie in das Dreieck um das Projekt zu verorten' },
            { n: '3', text: 'Nutzen Sie das KI-Sparring für eine zweite Einschätzung' },
          ].map((step) => (
            <div key={step.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {step.n}
              </span>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, paddingTop: 2 }}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={dismiss} style={{ width: '100%', padding: '10px 16px' }}>
          Verstanden
        </button>

        <button
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            fontSize: 11,
            cursor: 'pointer',
            textAlign: 'center',
            padding: 0,
          }}
        >
          Nicht mehr anzeigen
        </button>
      </div>
    </div>
  );
}
