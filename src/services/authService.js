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
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned non-JSON response');
            }
            
            const text = await response.text();
            if (!text) {
                throw new Error('Server returned empty response');
            }
            
            const user = JSON.parse(text);
            
            // Map legacy backend roles to frontend roles if needed
            const roleMap = {
                'borrower': 'Student',
                'lender': 'Lender',
                'admin': 'Admin'
            };
            
            const frontendRole = roleMap[user.role] || user.role;
            
            // Ensure all required fields are present with defaults
            return {
                ...user,
                id: user._id || user.id,
                name: user.name || 'User',
                email: user.email || '',
                role: frontendRole,
                isVerified: user.isVerified !== undefined ? user.isVerified : (frontendRole === 'Student'),
                socialTrustScore: user.socialTrustScore !== undefined ? user.socialTrustScore : (frontendRole === 'Student' ? 100 : null),
                aiCreditScore: user.aiCreditScore !== undefined ? user.aiCreditScore : null,
                securityDeposit: user.securityDeposit !== undefined ? user.securityDeposit : 0,
                availableSecurityDeposit: user.availableSecurityDeposit !== undefined ? user.availableSecurityDeposit : (user.securityDeposit || 0),
                securityDepositHistory: user.securityDepositHistory || [],
                isAuthenticated: true
            };
        } else {
             const contentType = response.headers.get('content-type');
             let errorMessage = 'Login failed. Please try again.';
             
             if (contentType && contentType.includes('application/json')) {
                 try {
                     const text = await response.text();
                     if (text) {
                         const err = JSON.parse(text);
                         errorMessage = err.message || errorMessage;
                     }
                 } catch (parseError) {
                     // If JSON parsing fails, use default message
                 }
             }
             
             throw new Error(errorMessage);
        }
    } catch (error) {
        if (error.message && (error.message.includes('Login failed') || error.message.includes('Server returned'))) {
            throw error;
        }
        throw new Error('Unable to connect to server. Please make sure the server is running.');
    }
  },

  async signup(email, password, name, role, isStudentVerified = false, securityDeposit = 500) {
      try {
          const simulatedAuthId = btoa(email);
          
          const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  name: name,
                  email: email,
                  simulatedAuthId: simulatedAuthId,
                  role: role
              })
          });

          if (!response.ok) {
              const contentType = response.headers.get('content-type');
              let errorMessage = 'Signup failed. Please try again.';
              
              if (contentType && contentType.includes('application/json')) {
                  try {
                      const text = await response.text();
                      if (text) {
                          const err = JSON.parse(text);
                          errorMessage = err.message || errorMessage;
                      }
                  } catch (parseError) {
                      // If JSON parsing fails, use default message
                  }
              }
              
              throw new Error(errorMessage);
          }

          const contentType = response.headers.get('content-type');
          if (!contentType || !contentType.includes('application/json')) {
              throw new Error('Server returned non-JSON response');
          }
          
          const text = await response.text();
          if (!text) {
              throw new Error('Server returned empty response');
          }
          
          const user = JSON.parse(text);
          
          // Return user with frontend role format and additional fields
          return {
              ...user,
              id: user._id,
              role: role,
              isVerified: role === 'Student' ? isStudentVerified : false,
              socialTrustScore: role === 'Student' ? 100 : null,
              aiCreditScore: null,
              securityDeposit: securityDeposit,
              availableSecurityDeposit: securityDeposit,
              securityDepositHistory: [{
                  date: new Date().toISOString(),
                  type: 'deposit',
                  amount: securityDeposit,
                  description: 'Initial security deposit',
                  balance: securityDeposit,
              }],
              isAuthenticated: true
          };
      } catch (error) {
          if (error.message && (error.message.includes('Signup failed') || error.message.includes('Server returned'))) {
              throw error;
          }
          throw new Error('Unable to connect to server. Please make sure the server is running.');
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

