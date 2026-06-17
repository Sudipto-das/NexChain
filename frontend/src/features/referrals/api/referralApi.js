const API_BASE = 'http://localhost:5000/api/referrals';

export const referralApi = {
  async getDirectReferrals(page = 1, limit = 20) {
    const res = await fetch(`${API_BASE}/direct?page=${page}&limit=${limit}`, {
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch direct referrals');
    }
    return result;
  },

  async getReferralStats() {
    const res = await fetch(`${API_BASE}/stats`, {
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch referral stats');
    }
    return result.stats;
  },

  async getReferralTree(maxDepth = 10) {
    const res = await fetch(`${API_BASE}/tree?maxDepth=${maxDepth}`, {
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch referral tree');
    }
    return result;
  },
};
