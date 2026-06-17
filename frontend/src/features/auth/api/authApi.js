const API_BASE = 'http://localhost:5000/api/auth';

export const authApi = {
  /**
   * Register a new user account.
   * @param {Object} data - { fullName, email, mobileNumber, password, referralCode }
   */
  async signup(data) {
    const res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Signup failed');
    }
    return result;
  },

  /**
   * Log into an existing user account.
   * @param {Object} data - { email, password }
   */
  async login(data) {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Login failed');
    }
    return result;
  },

  /**
   * Terminate user session.
   */
  async logout() {
    const res = await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || 'Logout failed');
    }
    return result;
  },

  /**
   * Retrieve current user profile session if authenticated.
   * Returns null if unauthorized or session is expired.
   */
  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/me`, {
        credentials: 'include',
      });
      if (res.status === 401 || res.status === 403) {
        return null;
      }
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Failed to fetch user session');
      }
      return result.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
};
