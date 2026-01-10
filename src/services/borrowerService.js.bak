/**
 * Borrower Discovery Service
 * Manages available borrowers for lenders to invest in
 */

// Mock available borrowers for investment
let availableBorrowers = [];

// Load from localStorage
const loadBorrowers = () => {
  try {
    const saved = localStorage.getItem('lendwise_available_borrowers');
    if (saved) {
      availableBorrowers = JSON.parse(saved);
    }
  } catch (e) {
    availableBorrowers = [];
  }
};

// Save to localStorage
const saveBorrowers = () => {
  localStorage.setItem('lendwise_available_borrowers', JSON.stringify(availableBorrowers));
};

// Initialize
loadBorrowers();

// Generate mock borrowers if none exist
if (availableBorrowers.length === 0) {
  availableBorrowers = [
    {
      borrowerId: 'borrower-1',
      borrowerName: 'John Smith',
      loanAmount: 2000,
      duration: 12,
      purpose: 'Home Improvement',
      creditScore: 78,
      defaultProbability: 18,
      interestRate: 9.5,
      riskLevel: 'Low',
      aiRecommendation: 'Approve',
      aiExplanation: 'Recommended due to stable income and low default probability',
      employmentType: 'Salaried',
      monthlyIncome: 4500,
      repaymentBehavior: 'Excellent',
      fraudScreeningStatus: 'Cleared',
      incomeConsistency: 'Verified',
      riskMonitoring: 'Stable',
      createdAt: '2024-03-15',
    },
    {
      borrowerId: 'borrower-2',
      borrowerName: 'Maria Garcia',
      loanAmount: 1500,
      duration: 6,
      purpose: 'Education',
      creditScore: 85,
      defaultProbability: 12,
      interestRate: 7.8,
      riskLevel: 'Low',
      aiRecommendation: 'Approve',
      aiExplanation: 'Strong credit profile with excellent repayment history',
      employmentType: 'Salaried',
      monthlyIncome: 5200,
      repaymentBehavior: 'Excellent',
      fraudScreeningStatus: 'Cleared',
      incomeConsistency: 'Verified',
      riskMonitoring: 'Stable',
      createdAt: '2024-03-14',
    },
    {
      borrowerId: 'borrower-3',
      borrowerName: 'Robert Brown',
      loanAmount: 3000,
      duration: 18,
      purpose: 'Business',
      creditScore: 65,
      defaultProbability: 28,
      interestRate: 12.5,
      riskLevel: 'Medium',
      aiRecommendation: 'Conditional',
      aiExplanation: 'Moderate risk profile, requires careful monitoring',
      employmentType: 'Freelance',
      monthlyIncome: 3800,
      repaymentBehavior: 'Average',
      fraudScreeningStatus: 'Cleared',
      incomeConsistency: 'Verified',
      riskMonitoring: 'Watch',
      createdAt: '2024-03-13',
    },
    {
      borrowerId: 'borrower-4',
      borrowerName: 'Emily Chen',
      loanAmount: 1200,
      duration: 9,
      purpose: 'Medical',
      creditScore: 72,
      defaultProbability: 22,
      interestRate: 10.2,
      riskLevel: 'Medium',
      aiRecommendation: 'Approve',
      aiExplanation: 'Acceptable risk with stable employment',
      employmentType: 'Salaried',
      monthlyIncome: 4000,
      repaymentBehavior: 'Average',
      fraudScreeningStatus: 'Cleared',
      incomeConsistency: 'Verified',
      riskMonitoring: 'Stable',
      createdAt: '2024-03-12',
    },
  ];
  saveBorrowers();
}

export const borrowerService = {
  /**
   * Get all available borrowers
   */
  getAvailableBorrowers(filters = {}) {
    let filtered = [...availableBorrowers];

    // Filter by risk level
    if (filters.riskLevel && filters.riskLevel !== 'All') {
      filtered = filtered.filter(b => b.riskLevel === filters.riskLevel);
    }

    // Filter by interest rate range
    if (filters.minInterest !== undefined) {
      filtered = filtered.filter(b => b.interestRate >= filters.minInterest);
    }
    if (filters.maxInterest !== undefined) {
      filtered = filtered.filter(b => b.interestRate <= filters.maxInterest);
    }

    // Filter by loan amount range
    if (filters.minAmount !== undefined) {
      filtered = filtered.filter(b => b.loanAmount >= filters.minAmount);
    }
    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter(b => b.loanAmount <= filters.maxAmount);
    }

    // Filter by duration
    if (filters.duration && filters.duration !== 'All') {
      filtered = filtered.filter(b => b.duration === Number(filters.duration));
    }

    // Search by name or purpose
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(b => 
        b.borrowerName.toLowerCase().includes(searchLower) ||
        b.purpose.toLowerCase().includes(searchLower)
      );
    }

    // Sort
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'lowestRisk':
          filtered.sort((a, b) => a.defaultProbability - b.defaultProbability);
          break;
        case 'highestReturn':
          filtered.sort((a, b) => b.interestRate - a.interestRate);
          break;
        case 'aiRecommendation':
          filtered.sort((a, b) => {
            const order = { 'Approve': 1, 'Conditional': 2, 'Reject': 3 };
            return (order[a.aiRecommendation] || 99) - (order[b.aiRecommendation] || 99);
          });
          break;
        default:
          break;
      }
    }

    return filtered;
  },

  /**
   * Get borrower by ID
   */
  getBorrower(borrowerId) {
    return availableBorrowers.find(b => b.borrowerId === borrowerId);
  },

  /**
   * Remove borrower from available list (when funded)
   */
  removeBorrower(borrowerId) {
    availableBorrowers = availableBorrowers.filter(b => b.borrowerId !== borrowerId);
    saveBorrowers();
  },
};

