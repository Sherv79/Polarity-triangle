import ThemeToggle from './ThemeToggle';

export default function Header() {
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
        Paradoxie-Dreieck
      </span>
      <ThemeToggle />
    </header>
  );
}
