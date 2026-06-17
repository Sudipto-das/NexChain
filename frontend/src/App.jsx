import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';
import { LoginPage } from './features/auth/pages/LoginPage';
import { SignupPage } from './features/auth/pages/SignupPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { InvestmentsPage } from './features/investment/pages/InvestmentsPage';
import { ReferralsPage } from './features/referrals/pages/ReferralsPage';
import { ProtectedRoute } from './app/routes/ProtectedRoute';
import { AppLayout } from './app/routes/AppLayout';
import { authApi } from './features/auth/api/authApi';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const currentUser = await authApi.getMe();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Failed to verify session:', err);
      } finally {
        setIsCheckingSession(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const handleSignupSuccess = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      navigate('/login');
    }
  };

  if (isCheckingSession) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-canvas-soft)',
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-ink)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="text-display-sm" style={{ marginBottom: 'var(--space-sm)' }}>
            Loading NexChain...
          </div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--color-hairline)',
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--color-canvas-soft)',
            padding: 'var(--space-lg)',
          }}>
            <LoginPage
              onSwitchToSignup={() => {}}
              onLoginSuccess={(userData) => {
                handleLoginSuccess(userData);
              }}
            />
          </div>
        )
      } />

      <Route path="/signup" element={
        user ? <Navigate to="/dashboard" replace /> : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--color-canvas-soft)',
            padding: 'var(--space-lg)',
          }}>
            <SignupPage
              onSwitchToLogin={() => {}}
              onSignupSuccess={(userData) => {
                handleSignupSuccess(userData);
              }}
            />
          </div>
        )
      } />

      <Route path="/" element={
        <ProtectedRoute user={user}>
          <AppLayout user={user} onLogout={handleLogout} />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="investments" element={<InvestmentsPage />} />
        <Route path="referrals" element={<ReferralsPage />} />
      </Route>

      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default App;
