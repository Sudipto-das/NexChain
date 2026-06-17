import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { referralApi } from '../api/referralApi';

export function ReferralsPage() {
  const { user } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, referralsData] = await Promise.all([
          referralApi.getReferralStats(),
          referralApi.getDirectReferrals(),
        ]);
        setStats(statsData);
        setReferrals(referralsData.referrals || []);
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
      {/* Page Header */}
      <section style={{ textAlign: 'left' }}>
        <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-xs)', color: 'var(--color-ink)' }}>
          Referrals.
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-body)' }}>
          Build your downline and earn level income.
        </p>
      </section>

      {/* Referral Stats */}
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
            REFERRAL CODE
          </h3>
          <div className="text-display-md" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0' }}>
            {user.referralCode || 'N/A'}
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
            DIRECT REFERRALS
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-ink)' }}>
            {isLoading ? '...' : (stats?.directReferrals ?? 0)}
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
            TOTAL DOWNLINE
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-violet)' }}>
            {isLoading ? '...' : (stats?.totalDownline ?? 0)}
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
          <div className="text-display-md" style={{ color: 'var(--color-success)' }}>
            {isLoading ? '...' : `$${(stats?.totalLevelIncome || 0).toLocaleString()}`}
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

      {/* Income by Level */}
      {stats?.incomeByLevel && stats.incomeByLevel.length > 0 && (
        <section className="shadow-4" style={{
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-xl)',
          textAlign: 'left',
        }}>
          <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-ink)' }}>
            Income by Level.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {stats.incomeByLevel.map((level) => (
              <div key={level.level} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 'var(--space-sm)',
                borderBottom: '1px solid var(--color-hairline)',
              }}>
                <div>
                  <span className="text-body-sm-strong" style={{ color: 'var(--color-ink)' }}>
                    Level {level.level}
                  </span>
                  <span className="text-caption" style={{ color: 'var(--color-mute)', marginLeft: 'var(--space-sm)' }}>
                    {level.count} referral{level.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-body-md-strong" style={{ color: 'var(--color-success)' }}>
                  ${level.totalAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Direct Referrals List */}
      <section className="shadow-4" style={{
        backgroundColor: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        textAlign: 'left',
      }}>
        <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-ink)' }}>
          Direct Referrals.
        </h2>

        {isLoading ? (
          <div className="text-body-md" style={{ color: 'var(--color-mute)', textAlign: 'center', padding: 'var(--space-2xl)' }}>
            Loading referrals...
          </div>
        ) : referrals.length === 0 ? (
          <div className="text-body-md" style={{ color: 'var(--color-mute)', textAlign: 'center', padding: 'var(--space-2xl)' }}>
            No referrals yet. Share your referral code to start earning.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {referrals.map((ref) => (
              <div key={ref._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 'var(--space-md)',
                borderBottom: '1px solid var(--color-hairline)',
                flexWrap: 'wrap',
                gap: 'var(--space-xs)',
              }}>
                <div>
                  <div className="text-body-sm-strong" style={{ color: 'var(--color-ink)' }}>
                    {ref.fullName}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--color-mute)' }}>
                    {ref.email}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: 'var(--space-xxs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-caption)',
                    fontWeight: 'var(--weight-medium)',
                    backgroundColor: ref.accountStatus === 'Active' ? 'var(--color-link-bg-soft)' : 'var(--color-error-soft)',
                    color: ref.accountStatus === 'Active' ? 'var(--color-link)' : 'var(--color-error-deep)',
                  }}>
                    {ref.accountStatus}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--color-body)', marginTop: 'var(--space-xxs)' }}>
                    Joined {new Date(ref.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
