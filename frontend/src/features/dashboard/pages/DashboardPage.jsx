import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { dashboardApi } from '../api/dashboardApi';

export function DashboardPage() {
  const { user } = useOutletContext();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardApi.getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <>
      {/* Welcome Section */}
      <section style={{ textAlign: 'left' }}>
        <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-xs)', color: 'var(--color-ink)' }}>
          Welcome back, {user.fullName.split(' ')[0]}.
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-body)' }}>
          Monitor your investments, referrals, and performance from one simple console.
        </p>
      </section>

      {/* Stats Grid */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-lg)',
      }}>
        {/* Card 1 - Account Status */}
        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            ACCOUNT STATUS
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
            <span style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-success)'
            }}></span>
            {user.accountStatus || 'Active'}
          </div>
          <p className="text-body-sm" style={{ color: 'var(--color-body)', marginTop: 'var(--space-sm)' }}>
            Registered: {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Card 2 - Referral Code */}
        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            REFERRAL CODE
          </h3>
          <div className="text-display-md" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0' }}>
            {user.referralCode || 'N/A'}
          </div>
          <p className="text-body-sm" style={{ color: 'var(--color-body)', marginTop: 'var(--space-sm)' }}>
            Share this code to build your investment downline.
          </p>
        </div>

        {/* Card 3 - Contact Number */}
        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            CONTACT NUMBER
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-ink)' }}>
            {user.mobileNumber}
          </div>
          <p className="text-body-sm" style={{ color: 'var(--color-body)', marginTop: 'var(--space-sm)' }}>
            Used for system verification and notifications.
          </p>
        </div>
      </section>

      {/* Financial Summary */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-lg)',
      }}>
        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            WALLET BALANCE
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-ink)' }}>
            {isLoading ? '...' : `$${(dashboardData?.walletBalance || 0).toLocaleString()}`}
          </div>
        </div>

        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            TOTAL INVESTMENTS
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-ink)' }}>
            {isLoading ? '...' : `$${(dashboardData?.totalInvestments || 0).toLocaleString()}`}
          </div>
        </div>

        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            TOTAL ROI EARNED
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-success)' }}>
            {isLoading ? '...' : `$${(dashboardData?.totalRoiEarned || 0).toLocaleString()}`}
          </div>
        </div>

        <div className="shadow-3" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-lg)',
          textAlign: 'left',
        }}>
          <h3 className="text-caption-mono" style={{ color: 'var(--color-mute)', marginBottom: 'var(--space-xs)' }}>
            LEVEL INCOME
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-violet)' }}>
            {isLoading ? '...' : `$${(dashboardData?.totalLevelIncomeEarned || 0).toLocaleString()}`}
          </div>
        </div>
      </section>

      {error && (
        <div style={{
          backgroundColor: 'var(--color-error-soft)',
          color: 'var(--color-error-deep)',
          padding: 'var(--space-sm)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--text-body-sm)',
          border: '1px solid var(--color-error)'
        }}>
          {error}
        </div>
      )}

      {/* System Information */}
      <section className="shadow-4" style={{
        backgroundColor: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        textAlign: 'left',
      }}>
        <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-ink)' }}>
          System Information.
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-hairline)' }}>
            <span className="text-body-sm-strong" style={{ color: 'var(--color-body)' }}>User ID</span>
            <span className="text-code" style={{ color: 'var(--color-ink)' }}>{user._id}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-hairline)' }}>
            <span className="text-body-sm-strong" style={{ color: 'var(--color-body)' }}>Full Name</span>
            <span className="text-body-sm" style={{ color: 'var(--color-ink)' }}>{user.fullName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-hairline)' }}>
            <span className="text-body-sm-strong" style={{ color: 'var(--color-body)' }}>Email Address</span>
            <span className="text-body-sm" style={{ color: 'var(--color-ink)' }}>{user.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-hairline)' }}>
            <span className="text-body-sm-strong" style={{ color: 'var(--color-body)' }}>Account Role</span>
            <span className="text-body-sm" style={{ color: 'var(--color-ink)' }}>{user.role || 'User'}</span>
          </div>
          {user.referredBy && (
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-hairline)' }}>
              <span className="text-body-sm-strong" style={{ color: 'var(--color-body)' }}>Referred By ID</span>
              <span className="text-code" style={{ color: 'var(--color-ink)' }}>{user.referredBy}</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
