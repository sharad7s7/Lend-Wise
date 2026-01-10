export const authService = {
  // Login (Simulated) - fetch user by email or register if doesn't exist
  async login(email, password) {
    // Attempt Login
    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            const user = await response.json();
            return {
                ...user,
                id: user._id, 
                isAuthenticated: true
            };
        } else {
             // If login fails (401), we assume for this hackathon flow that we might need to register?
             // Or we just throw error. The UI likely calls register separately.
             const err = await response.json();
             throw new Error(err.message);
        }
    } catch (error) {
        throw error;
    }
  },

  async register(userData) {
      const simulatedAuthId = btoa(userData.email);
      const response = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              name: userData.fullName,
              email: userData.email,
              simulatedAuthId: simulatedAuthId,
              role: userData.role
          })
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.message);
      }

      const user = await response.json();
      return {
          ...user,
          id: user._id,
          isAuthenticated: true
      };
  },

  logout() {
    localStorage.removeItem('lendwise_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('lendwise_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

