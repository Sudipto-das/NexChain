const API_BASE = 'http://localhost:5000/api/investments';

export const investmentApi = {
  async createInvestment(data) {
    const res = await fetch(`${API_BASE}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to create investment');
    }
    return result;
  },

  async getUserInvestments(status) {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/${params}`, {
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch investments');
    }
    return result.investments;
  },
};
