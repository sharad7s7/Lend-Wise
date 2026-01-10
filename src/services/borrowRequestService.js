export const borrowRequestService = {
  
  // Get all open requests (Explore)
  async getAllRequests() {
    try {
        const res = await fetch('/api/loans/explore');
        const data = await res.json();
        return data.map(loan => ({
            ...loan,
            requestId: loan._id,
            borrowerName: loan.borrower?.name || 'Unknown',
            aiCreditScore: loan.borrower?.riskScore,
            createdAt: loan.createdAt.split('T')[0],
            loanAmount: loan.amount, 
            purpose: loan.purpose,
            interestRate: loan.interestRate,
            riskLevel: loan.riskTier === 'A' ? 'Low' : loan.riskTier === 'B' ? 'Moderate' : 'High', 
            duration: loan.durationMonths
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
  },

  // Get my requests
  async getUserRequests(userId) {
     try {
        const res = await fetch(`/api/loans/my-loans/${userId}`);
        const data = await res.json();
        return data.map(loan => ({
            ...loan,
            requestId: loan._id,
            status: loan.status, 
            loanAmount: loan.amount, // Ensure consistent naming (loanAmount vs amount)
            amount: loan.amount,
            interestRate: loan.interestRate,
            duration: loan.durationMonths,
            createdAt: loan.createdAt.split('T')[0]
        }));
     } catch (e) {
         console.error(e);
         return [];
     }
  },

  // Create a new borrow request
  async createRequest(requestData) {
    const userStr = localStorage.getItem('lendwise_user');
    if (!userStr) throw new Error("User not logged in");
    const user = JSON.parse(userStr);

    // Call backend to create loan
    const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            borrowerId: user.id || user._id, 
            amount: Number(requestData.loanAmount || requestData.amount),
            durationMonths: Number(requestData.duration || requestData.durationMonths),
            purpose: requestData.purpose
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
    }

    return await res.json();
  },

  getRiskColor(tier) {
    if (tier === 'A' || tier === 'Low') return 'text-green-600 bg-green-100';
    if (tier === 'B' || tier === 'Moderate') return 'text-blue-600 bg-blue-100';
    if (tier === 'C' || tier === 'Yellow') return 'text-yellow-600 bg-yellow-100';
    if (tier === 'D' || tier === 'High') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  }
};

