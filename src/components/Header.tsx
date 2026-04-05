import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onExportPng: () => void;
}

export default function Header({ onExportPng }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 24px',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--bg-secondary)',
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
        Polarity-Dreieck
      </span>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="btn-secondary"
          onClick={onExportPng}
          style={{ padding: '6px 10px', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 6 }}
          aria-label="Als Bild speichern"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span style={{ fontSize: 12 }}>PNG</span>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
