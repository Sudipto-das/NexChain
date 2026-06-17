import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { investmentApi } from '../api/investmentApi';

export function InvestmentsPage() {
  const { user } = useOutletContext();
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const data = await investmentApi.getUserInvestments();
        setInvestments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvestments();
  }, []);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const activeInvestments = investments.filter(inv => inv.status === 'Active');

  return (
    <>
      {/* Page Header */}
      <section style={{ textAlign: 'left' }}>
        <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-xs)', color: 'var(--color-ink)' }}>
          Investments.
        </h1>
        <p className="text-body-lg" style={{ color: 'var(--color-body)' }}>
          Track and manage your investment portfolio.
        </p>
      </section>

      {/* Investment Stats */}
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
            TOTAL INVESTED
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-ink)' }}>
            {isLoading ? '...' : `$${totalInvested.toLocaleString()}`}
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
            ACTIVE INVESTMENTS
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-success)' }}>
            {isLoading ? '...' : activeInvestments.length}
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
            TOTAL PLANS
          </h3>
          <div className="text-display-md" style={{ color: 'var(--color-violet)' }}>
            {isLoading ? '...' : investments.length}
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

      {/* Investments List */}
      <section className="shadow-4" style={{
        backgroundColor: 'var(--color-canvas)',
        border: '1px solid var(--color-hairline)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        textAlign: 'left',
      }}>
        <h2 className="text-display-sm" style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-ink)' }}>
          Investment Plans.
        </h2>

        {isLoading ? (
          <div className="text-body-md" style={{ color: 'var(--color-mute)', textAlign: 'center', padding: 'var(--space-2xl)' }}>
            Loading investments...
          </div>
        ) : investments.length === 0 ? (
          <div className="text-body-md" style={{ color: 'var(--color-mute)', textAlign: 'center', padding: 'var(--space-2xl)' }}>
            No investments yet. Start building your portfolio.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {investments.map((inv) => (
              <div key={inv._id} className="shadow-2" style={{
                backgroundColor: 'var(--color-canvas-soft)',
                border: '1px solid var(--color-hairline)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-lg)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-md)',
              }}>
                <div>
                  <div className="text-body-md-strong" style={{ color: 'var(--color-ink)', marginBottom: 'var(--space-xxs)' }}>
                    {inv.planName}
                  </div>
                  <div className="text-caption-mono" style={{ color: 'var(--color-mute)' }}>
                    INVESTED ${inv.investmentAmount.toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    display: 'inline-block',
                    padding: 'var(--space-xxs) var(--space-sm)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-caption)',
                    fontWeight: 'var(--weight-medium)',
                    backgroundColor: inv.status === 'Active' ? 'var(--color-link-bg-soft)' : inv.status === 'Completed' ? 'var(--color-cyan-soft)' : 'var(--color-error-soft)',
                    color: inv.status === 'Active' ? 'var(--color-link)' : inv.status === 'Completed' ? 'var(--color-cyan-deep)' : 'var(--color-error-deep)',
                    marginBottom: 'var(--space-xxs)',
                  }}>
                    {inv.status}
                  </div>
                  <div className="text-caption" style={{ color: 'var(--color-body)' }}>
                    {inv.dailyRoiPercentage}% daily &middot; {inv.planDurationDays} days
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
