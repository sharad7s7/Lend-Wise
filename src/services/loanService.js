/**
 * Loan Service
 * Manages all loans (both Friend Circle and AI Marketplace)
 */

// Standardized loan data structure
let loans = [];

// Load from localStorage
const loadLoans = () => {
  try {
    const saved = localStorage.getItem('lendwise_loans');
    if (saved) {
      loans = JSON.parse(saved);
    }
  } catch (e) {
    loans = [];
  }
};

// Save to localStorage
const saveLoans = () => {
  localStorage.setItem('lendwise_loans', JSON.stringify(loans));
};

// Initialize loans
loadLoans();

// Note: Loans are created dynamically when users interact with the system
// For demo purposes, you can add initial loans here if needed

export const loanService = {
  /**
   * Get all loans for a user (as borrower or lender)
   */
  getUserLoans(userId) {
    return loans.filter(
      loan => loan.borrowerId === userId || loan.lenderId === userId
    );
  },

  /**
   * Get loans where user is borrower
   */
  getBorrowingHistory(userId) {
    return loans.filter(loan => loan.borrowerId === userId);
  },

  /**
   * Get loans where user is lender
   */
  getLendingHistory(userId) {
    return loans.filter(loan => loan.lenderId === userId);
  },

  /**
   * Create a new loan
   */
  createLoan(loanData) {
    const newLoan = {
      loanId: `loan-${Date.now()}`,
      ...loanData,
      createdAt: new Date().toISOString().split('T')[0],
      status: loanData.status || 'Pending',
      completedAt: null,
      interestPaid: 0,
      riskMonitoring: loanData.riskMonitoring || 'Stable',
    };
    loans.push(newLoan);
    saveLoans();
    return newLoan;
  },

  /**
   * Update loan status
   */
  updateLoanStatus(loanId, status, interestPaid = 0) {
    const loan = loans.find(l => l.loanId === loanId);
    if (loan) {
      loan.status = status;
      if (status === 'Completed') {
        loan.completedAt = new Date().toISOString().split('T')[0];
        loan.interestPaid = interestPaid;
      }
      saveLoans();
    }
    return loan;
  },

  /**
   * Get loan statistics for a user
   */
  getLoanStats(userId) {
    const allLoans = this.getUserLoans(userId);
    const borrowing = this.getBorrowingHistory(userId);
    const lending = this.getLendingHistory(userId);

    return {
      totalBorrowed: borrowing.reduce((sum, l) => sum + l.amount, 0),
      totalLent: lending.reduce((sum, l) => sum + l.amount, 0),
      activeBorrowing: borrowing.filter(l => l.status === 'Active').length,
      activeLending: lending.filter(l => l.status === 'Active').length,
      totalInterestPaid: borrowing.reduce((sum, l) => sum + (l.interestPaid || 0), 0),
      totalReturnsEarned: lending
        .filter(l => l.status === 'Completed')
        .reduce((sum, l) => sum + (l.interestPaid || 0), 0),
      completedLoans: allLoans.filter(l => l.status === 'Completed').length,
      defaultedLoans: allLoans.filter(l => l.status === 'Defaulted').length,
    };
  },
};

