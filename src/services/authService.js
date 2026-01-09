/**
 * Mock Authentication Service
 * In production, this would communicate with a backend API
 */

// Mock user database
const mockUsers = [
  {
    id: 'user-1',
    email: 'student@university.edu',
    password: 'password123',
    name: 'Alex Johnson',
    role: 'Student',
    isVerified: true,
    socialTrustScore: 92,
    aiCreditScore: null,
    securityDeposit: 1000,
    availableSecurityDeposit: 1000,
    securityDepositHistory: [
      {
        date: new Date().toISOString(),
        type: 'deposit',
        amount: 1000,
        description: 'Initial security deposit',
        balance: 1000,
      }
    ],
  },
  {
    id: 'user-2',
    email: 'lender@example.com',
    password: 'password123',
    name: 'Sarah Lender',
    role: 'Lender',
    isVerified: true,
    socialTrustScore: null,
    aiCreditScore: null,
    securityDeposit: 0,
    availableSecurityDeposit: 0,
    securityDepositHistory: [],
  },
  {
    id: 'user-3',
    email: 'user@example.com',
    password: 'password123',
    name: 'John Smith',
    role: 'Non-student',
    isVerified: false,
    socialTrustScore: null,
    aiCreditScore: 75,
    securityDeposit: 1500,
    availableSecurityDeposit: 1500,
    securityDepositHistory: [
      {
        date: new Date().toISOString(),
        type: 'deposit',
        amount: 1500,
        description: 'Initial security deposit',
        balance: 1500,
      }
    ],
  },
  {
    id: 'admin-1',
    email: 'admin@lendwise.com',
    password: 'password123',
    name: 'Admin User',
    role: 'Admin',
    isVerified: true,
    socialTrustScore: null,
    aiCreditScore: null,
    securityDeposit: 0,
    availableSecurityDeposit: 0,
    securityDepositHistory: [],
  },
];

export const authService = {
  /**
   * Mock login - validates credentials
   */
  async login(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Mock signup - creates new user
   */
  async signup(email, password, name, role, isStudentVerified = false, securityDeposit = 500) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if user exists
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Validate student email if student role
    if (role === 'Student' && !isStudentVerified) {
      // In real app, would verify .edu email
      if (!email.includes('.edu')) {
        throw new Error('Student accounts require a valid .edu email address');
      }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password, // In production, this would be hashed
      name,
      role,
      isVerified: role === 'Student' ? isStudentVerified : false,
      socialTrustScore: role === 'Student' ? 100 : null, // New students start with perfect trust
      aiCreditScore: role === 'Student' ? null : null, // Will be calculated on first assessment
      securityDeposit: securityDeposit, // Security deposit amount
      availableSecurityDeposit: securityDeposit, // Available balance (can be deducted)
      securityDepositHistory: [
        {
          date: new Date().toISOString(),
          type: 'deposit',
          amount: securityDeposit,
          description: 'Initial security deposit',
          balance: securityDeposit,
        }
      ], // Track all security deposit transactions
    };

    mockUsers.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  /**
   * Mock password reset (not implemented in UI)
   */
  async resetPassword(email) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Email not found');
    }
    return { success: true };
  },

  /**
   * Deduct from security deposit (used when loan is not repaid)
   */
  deductSecurityDeposit(userId, amount, reason = 'Loan default') {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.availableSecurityDeposit < amount) {
      throw new Error(`Insufficient security deposit. Available: $${user.availableSecurityDeposit}`);
    }

    user.availableSecurityDeposit -= amount;
    user.securityDepositHistory.push({
      date: new Date().toISOString(),
      type: 'deduction',
      amount: amount,
      description: reason,
      balance: user.availableSecurityDeposit,
    });

    return {
      success: true,
      deductedAmount: amount,
      remainingBalance: user.availableSecurityDeposit,
    };
  },

  /**
   * Refund security deposit (used when loan is repaid on time)
   */
  refundSecurityDeposit(userId, amount, reason = 'Loan repaid on time') {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    const originalDeposit = user.securityDepositHistory[0]?.amount || user.securityDeposit;
    if (user.availableSecurityDeposit + amount > originalDeposit) {
      throw new Error('Cannot refund more than original deposit');
    }

    user.availableSecurityDeposit += amount;
    user.securityDepositHistory.push({
      date: new Date().toISOString(),
      type: 'refund',
      amount: amount,
      description: reason,
      balance: user.availableSecurityDeposit,
    });

    return {
      success: true,
      refundedAmount: amount,
      remainingBalance: user.availableSecurityDeposit,
    };
  },

  /**
   * Get security deposit details for a user
   */
  getSecurityDepositInfo(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      totalDeposit: user.securityDeposit,
      availableBalance: user.availableSecurityDeposit,
      deductedAmount: user.securityDeposit - user.availableSecurityDeposit,
      history: user.securityDepositHistory || [],
    };
  },
};

