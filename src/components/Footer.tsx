export default function Footer() {
  return (
    <footer
      style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        textAlign: 'center',
        color: 'var(--text-tertiary)',
        fontSize: 11,
        lineHeight: 1.6,
        backgroundColor: 'var(--bg-secondary)',
        transition: 'background-color 150ms ease, border-color 150ms ease',
      }}
    >
      <div>Paradoxie-Dreieck | Workshop-Instrument zur Verortung von KI-Projekten</div>
      <div>Konzept: Prof. Dr. Thomas Schumacher, osb international</div>
    </footer>
  );
}
