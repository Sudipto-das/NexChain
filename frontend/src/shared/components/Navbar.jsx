import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../features/auth/api/authApi';

const linkStyle = (isActive) => ({
  color: isActive ? 'var(--color-ink)' : 'var(--color-body)',
  fontWeight: isActive ? 'var(--weight-medium)' : 'var(--weight-regular)',
  fontSize: 'var(--text-body-sm)',
  padding: 'var(--space-xs) var(--space-sm)',
  cursor: 'pointer',
  borderRadius: 'var(--radius-full)',
  backgroundColor: isActive ? 'var(--color-canvas-soft-2)' : 'transparent',
  transition: 'background-color var(--transition-fast)',
  textDecoration: 'none',
});

export function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      onLogout();
    }
  };

  return (
    <header className="shadow-1" style={{
      height: '64px',
      backgroundColor: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline)',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--space-lg)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        <div
          className="text-display-sm"
          style={{ fontWeight: 'var(--weight-semibold)', letterSpacing: '-0.6px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          NexChain.
        </div>

        <nav style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <span
            style={linkStyle(location.pathname === '/dashboard')}
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </span>
          <span
            style={linkStyle(location.pathname === '/investments')}
            onClick={() => navigate('/investments')}
          >
            Investments
          </span>
          <span
            style={linkStyle(location.pathname === '/referrals')}
            onClick={() => navigate('/referrals')}
          >
            Referrals
          </span>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="text-body-sm-strong" style={{ color: 'var(--color-ink)' }}>
              {user.fullName}
            </span>
            <span className="text-caption" style={{ color: 'var(--color-mute)' }}>
              {user.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="shadow-2"
            style={{
              backgroundColor: 'var(--color-canvas)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-hairline)',
              padding: 'var(--space-xxs) var(--space-sm)',
              height: '32px',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-button-md)',
              fontWeight: 'var(--weight-medium)',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-canvas-soft-2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--color-canvas)'}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
