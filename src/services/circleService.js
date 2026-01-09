/**
 * Friend Circle Service
 * Manages circles, members, loans, and trust calculations
 */

import { mockCircles, mockLoans } from '../mockData/circles';

let circles = [...mockCircles];
let loans = [...mockLoans];

// Load from localStorage
const loadData = () => {
  try {
    const savedCircles = localStorage.getItem('lendwise_circles');
    const savedLoans = localStorage.getItem('lendwise_circle_loans');
    if (savedCircles) circles = JSON.parse(savedCircles);
    if (savedLoans) loans = JSON.parse(savedLoans);
  } catch (e) {
    // Use defaults
  }
};

// Save to localStorage
const saveData = () => {
  localStorage.setItem('lendwise_circles', JSON.stringify(circles));
  localStorage.setItem('lendwise_circle_loans', JSON.stringify(loans));
};

// Initialize
loadData();

/**
 * Calculate personal trust score
 */
function calculatePersonalTrustScore(member) {
  let score = 100;
  
  // Repayment rate impact (0-40 points)
  score = score * 0.4 + (member.repaymentRate || 0) * 0.4;
  
  // Streak bonus (0-20 points)
  const streakBonus = Math.min(20, (member.repaymentStreak || 0) * 2);
  score += streakBonus;
  
  // Default penalty (-30 points per default)
  score -= (member.defaultedLoans || 0) * 30;
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Calculate circle trust score
 */
function calculateCircleTrustScore(circle) {
  if (circle.members.length === 0) return 100;
  
  const avgTrust = circle.members.reduce((sum, m) => sum + (m.personalTrustScore || 0), 0) / circle.members.length;
  const defaultRate = circle.defaultedLoans / Math.max(1, circle.totalLoans);
  
  return Math.max(0, Math.min(100, Math.round(avgTrust * (1 - defaultRate * 0.5))));
}

export const circleService = {
  /**
   * Get all circles for a user
   */
  getUserCircles(userId) {
    return circles.filter(c => 
      c.members.some(m => m.id === userId) || c.adminId === userId
    );
  },

  /**
   * Get circle by ID
   */
  getCircle(circleId) {
    return circles.find(c => c.id === circleId);
  },

  /**
   * Create a new circle
   */
  createCircle(name, adminId, adminName, adminEmail) {
    const newCircle = {
      id: `circle-${Date.now()}`,
      name,
      adminId,
      members: [{
        id: adminId,
        name: adminName,
        email: adminEmail,
        trustBadge: 'Good',
        personalTrustScore: 100,
        repaymentRate: 100,
        repaymentStreak: 0,
        totalLoans: 0,
        defaultedLoans: 0,
        isAdmin: true,
      }],
      circleTrustScore: 100,
      totalLoans: 0,
      activeLoans: 0,
      completedLoans: 0,
      defaultedLoans: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    
    circles.push(newCircle);
    saveData();
    return newCircle;
  },

  /**
   * Add member to circle (mock invite)
   */
  inviteMember(circleId, email, name) {
    const circle = circles.find(c => c.id === circleId);
    if (!circle) throw new Error('Circle not found');
    
    const newMember = {
      id: `user-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      trustBadge: 'Good',
      personalTrustScore: 100,
      repaymentRate: 100,
      repaymentStreak: 0,
      totalLoans: 0,
      defaultedLoans: 0,
      isAdmin: false,
    };
    
    circle.members.push(newMember);
    circle.circleTrustScore = calculateCircleTrustScore(circle);
    saveData();
    return newMember;
  },

  /**
   * Create a loan
   */
  createLoan(circleId, lenderId, borrowerId, amount, purpose) {
    const circle = circles.find(c => c.id === circleId);
    if (!circle) throw new Error('Circle not found');
    
    const borrower = circle.members.find(m => m.id === borrowerId);
    if (!borrower) throw new Error('Borrower not found');
    
    // Check loan caps
    const studentLoanCap = 1000; // Max per student
    const activeLoansForBorrower = loans.filter(
      l => l.borrowerId === borrowerId && l.status === 'Active'
    );
    const totalActive = activeLoansForBorrower.reduce((sum, l) => sum + l.amount, 0);
    
    if (totalActive + amount > studentLoanCap) {
      throw new Error(`Loan amount exceeds cap. Maximum outstanding: $${studentLoanCap}`);
    }
    
    const newLoan = {
      id: `loan-${Date.now()}`,
      circleId,
      lenderId,
      borrowerId,
      borrowerName: borrower.name,
      amount,
      purpose: purpose || 'General',
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      gracePeriod: 7,
      remindersSent: 0,
      isOverdue: false,
    };
    
    loans.push(newLoan);
    circle.activeLoans += 1;
    circle.totalLoans += 1;
    saveData();
    return newLoan;
  },

  /**
   * Get loans for a user
   */
  getUserLoans(userId) {
    return loans.filter(l => l.lenderId === userId || l.borrowerId === userId);
  },

  /**
   * Update trust scores after repayment/default
   */
  recordRepayment(loanId, onTime = true) {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;
    
    const circle = circles.find(c => c.id === loan.circleId);
    if (!circle) return;
    
    const member = circle.members.find(m => m.id === loan.borrowerId);
    if (!member) return;
    
    if (onTime) {
      member.repaymentStreak += 1;
      member.totalLoans += 1;
      member.repaymentRate = ((member.repaymentRate * (member.totalLoans - 1)) + 100) / member.totalLoans;
    } else {
      member.defaultedLoans += 1;
      member.repaymentStreak = 0;
      member.totalLoans += 1;
      member.repaymentRate = ((member.repaymentRate * (member.totalLoans - 1)) + 0) / member.totalLoans;
    }
    
    member.personalTrustScore = calculatePersonalTrustScore(member);
    member.trustBadge = member.personalTrustScore >= 85 ? 'Good' : member.personalTrustScore >= 70 ? 'Average' : 'Risky';
    
    circle.circleTrustScore = calculateCircleTrustScore(circle);
    loan.status = onTime ? 'Completed' : 'Defaulted';
    circle.activeLoans -= 1;
    if (onTime) circle.completedLoans += 1;
    else circle.defaultedLoans += 1;
    
    saveData();
  },
};

