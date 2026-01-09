/**
 * Borrow Request Service
 * Manages borrow requests created by users
 */

let borrowRequests = [];

// Load from localStorage
const loadRequests = () => {
  try {
    const saved = localStorage.getItem('lendwise_borrow_requests');
    if (saved) {
      borrowRequests = JSON.parse(saved);
    }
  } catch (e) {
    borrowRequests = [];
  }
};

// Save to localStorage
const saveRequests = () => {
  localStorage.setItem('lendwise_borrow_requests', JSON.stringify(borrowRequests));
};

// Initialize
loadRequests();

export const borrowRequestService = {
  /**
   * Create a new borrow request
   */
  createRequest(requestData) {
    const newRequest = {
      requestId: `req-${Date.now()}`,
      ...requestData,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      fundedAt: null,
      lenderId: null,
      lenderName: null,
      interestRate: null,
    };
    borrowRequests.push(newRequest);
    saveRequests();
    return newRequest;
  },

  /**
   * Get all open requests (for Lend page - excludes current user's requests)
   */
  getOpenRequests(excludeUserId) {
    return borrowRequests.filter(
      req => req.status === 'Open' && req.borrowerId !== excludeUserId
    );
  },

  /**
   * Get user's borrow requests
   */
  getUserRequests(userId) {
    return borrowRequests.filter(req => req.borrowerId === userId);
  },

  /**
   * Fund a borrow request (convert to loan)
   */
  fundRequest(requestId, lenderId, lenderName, interestRate, riskLevel, creditScore, defaultProbability) {
    const request = borrowRequests.find(r => r.requestId === requestId);
    if (!request) return null;

    request.status = 'Funded';
    request.fundedAt = new Date().toISOString().split('T')[0];
    request.lenderId = lenderId;
    request.lenderName = lenderName;
    request.interestRate = interestRate;
    request.riskLevel = riskLevel;
    request.creditScore = creditScore;
    request.defaultProbability = defaultProbability;

    saveRequests();
    return request;
  },

  /**
   * Get request by ID
   */
  getRequest(requestId) {
    return borrowRequests.find(r => r.requestId === requestId);
  },
};

