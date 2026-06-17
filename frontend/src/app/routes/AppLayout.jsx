import { Outlet } from 'react-router';
import { Navbar } from '../../shared/components/Navbar';
import { Footer } from '../../shared/components/Footer';

export function AppLayout({ user, onLogout }) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas-soft)',
      fontFamily: 'var(--font-sans)',
      color: 'var(--color-ink)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Navbar user={user} onLogout={onLogout} />

      <main className="container" style={{
        flex: 1,
        paddingTop: 'var(--space-2xl)',
        paddingBottom: 'var(--space-2xl)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2xl)',
        maxWidth: '1200px',
        width: '100%',
      }}>
        <Outlet context={{ user }} />
      </main>

      <Footer />
    </div>
  );
}
