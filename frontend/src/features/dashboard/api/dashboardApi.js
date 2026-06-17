const API_BASE = 'http://localhost:5000/api/dashboard';

export const dashboardApi = {
  async getDashboard() {
    const res = await fetch(`${API_BASE}/`, {
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Failed to fetch dashboard data');
    }
    return result.dashboard;
  },
};
