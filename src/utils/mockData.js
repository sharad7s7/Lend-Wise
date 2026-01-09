/**
 * Mock data for LendWise application
 */

// Mock friend circles
export const mockCircles = [
  {
    id: 'circle-1',
    name: 'College Friends',
    members: [
      { id: 'user-1', name: 'Alex Johnson', trustBadge: 'Good', repaymentRate: 95 },
      { id: 'user-2', name: 'Sarah Chen', trustBadge: 'Good', repaymentRate: 98 },
      { id: 'user-3', name: 'Mike Davis', trustBadge: 'Average', repaymentRate: 85 },
    ],
    circleTrustScore: 92,
    totalLoans: 12,
    activeLoans: 3,
  },
  {
    id: 'circle-2',
    name: 'Study Group',
    members: [
      { id: 'user-4', name: 'Emma Wilson', trustBadge: 'Good', repaymentRate: 97 },
      { id: 'user-5', name: 'David Lee', trustBadge: 'Average', repaymentRate: 88 },
    ],
    circleTrustScore: 88,
    totalLoans: 8,
    activeLoans: 2,
  },
];

// Mock lender dashboard data
export const mockBorrowers = [
  {
    id: 'borrower-1',
    name: 'Alex Johnson',
    trustType: 'Social',
    riskLevel: 'Low',
    interestRate: 0,
    loanAmount: 500,
    status: 'Active',
    circleName: 'College Friends',
    aiRecommendation: 'Trusted',
  },
  {
    id: 'borrower-2',
    name: 'Sarah Chen',
    trustType: 'Social',
    riskLevel: 'Low',
    interestRate: 0,
    loanAmount: 300,
    status: 'Active',
    circleName: 'College Friends',
    aiRecommendation: 'Trusted',
  },
  {
    id: 'borrower-3',
    name: 'John Smith',
    trustType: 'AI',
    riskLevel: 'Medium',
    interestRate: 10.5,
    loanAmount: 2000,
    status: 'Active',
    creditScore: 72,
    aiRecommendation: 'Approve',
  },
  {
    id: 'borrower-4',
    name: 'Maria Garcia',
    trustType: 'AI',
    riskLevel: 'Low',
    interestRate: 7.8,
    loanAmount: 1500,
    status: 'Pending',
    creditScore: 85,
    aiRecommendation: 'Approve',
  },
  {
    id: 'borrower-5',
    name: 'Robert Brown',
    trustType: 'AI',
    riskLevel: 'High',
    interestRate: 18.2,
    loanAmount: 3000,
    status: 'Active',
    creditScore: 52,
    aiRecommendation: 'Conditional',
  },
];

// Mock user profile
export const mockUser = {
  id: 'current-user',
  name: 'You',
  trustBadge: 'Good',
  circles: mockCircles,
};

