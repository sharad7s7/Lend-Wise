export const borrowRequestService = {
  
  // Get all open requests (Explore)
  async getAllRequests() {
    try {
        const res = await fetch('/api/loans/explore');
        if (!res.ok) {
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data.map(loan => ({
            ...loan,
            requestId: loan._id,
            borrowerName: loan.borrower?.name || 'Unknown',
            aiCreditScore: loan.borrower?.riskScore,
            createdAt: loan.createdAt ? loan.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
            loanAmount: loan.amount, 
            purpose: loan.purpose || 'General',
            interestRate: loan.interestRate || 0,
            riskLevel: loan.riskTier === 'A' ? 'Low' : loan.riskTier === 'B' ? 'Moderate' : 'High', 
            duration: loan.durationMonths || 12
        })) : [];
    } catch (e) {
        console.error('Error fetching all requests:', e);
        return [];
    }
  },

  // Get my requests
  async getUserRequests(userId) {
     try {
        const res = await fetch(`/api/loans/my-loans/${userId}`);
        if (!res.ok) {
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data.map(loan => ({
            ...loan,
            requestId: loan._id,
            id: loan._id,
            status: loan.status || 'Open', 
            loanAmount: loan.amount, // Ensure consistent naming (loanAmount vs amount)
            amount: loan.amount,
            interestRate: loan.interestRate,
            duration: loan.durationMonths,
            durationMonths: loan.durationMonths,
            createdAt: loan.createdAt ? (typeof loan.createdAt === 'string' ? loan.createdAt.split('T')[0] : new Date(loan.createdAt).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
            // Include certificate data
            certificateSubmitted: loan.certificateSubmitted || false,
            certificateSubmissionDate: loan.certificateSubmissionDate || null,
            certificateDeadline: loan.certificateDeadline || null,
            certificateData: loan.certificateData || null,
        })) : [];
     } catch (e) {
         console.error('Error fetching user requests:', e);
         return [];
     }
  },

  // Create a new borrow request
  async createRequest(requestData) {
    try {
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
              purpose: requestData.purpose || 'General'
          })
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Failed to create borrow request';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const text = await res.text();
            if (text) {
              const err = JSON.parse(text);
              errorMessage = err.message || errorMessage;
            }
          } catch (parseError) {
            // Use default message
          }
        }
        
        throw new Error(errorMessage);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const text = await res.text();
      if (!text) {
        throw new Error('Server returned empty response');
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error in createRequest:', error);
      throw error;
    }
  },

  // Submit certificate for a loan
  async submitCertificate(loanId, certificateData) {
    try {
      const res = await fetch(`/api/loans/${loanId}/certificate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          principal: certificateData.principal,
          interest: certificateData.interest,
          total: certificateData.total,
          signedBy: certificateData.signedBy || 'Borrower',
        })
      });

      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMessage = 'Failed to submit certificate';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const text = await res.text();
            if (text) {
              const err = JSON.parse(text);
              errorMessage = err.message || errorMessage;
            }
          } catch (parseError) {
            // Use default message
          }
        }
        
        throw new Error(errorMessage);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const text = await res.text();
      if (!text) {
        throw new Error('Server returned empty response');
      }
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Error submitting certificate:', error);
      throw error;
    }
  },

  getRiskColor(tier) {
    if (tier === 'A' || tier === 'Low') return 'text-green-600 bg-green-100';
    if (tier === 'B' || tier === 'Moderate') return 'text-blue-600 bg-blue-100';
    if (tier === 'C' || tier === 'Yellow') return 'text-yellow-600 bg-yellow-100';
    if (tier === 'D' || tier === 'High') return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  }
};

