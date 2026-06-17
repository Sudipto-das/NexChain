export function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-canvas)',
      borderTop: '1px solid var(--color-hairline)',
      padding: 'var(--space-xl) var(--space-lg)',
      marginTop: 'auto',
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
      }}>
        <span className="text-caption" style={{ color: 'var(--color-mute)' }}>
          &copy; {new Date().getFullYear()} NexChain Inc. All rights reserved.
        </span>
        <span className="text-caption-mono" style={{ color: 'var(--color-mute)' }}>
          PLATFORM BRAND VERCEL
        </span>
      </div>
    </footer>
  );
}