export const loanService = {
  
  // Get loans for a user (as borrower)
  async getBorrowingHistory(userId) {
    try {
      const res = await fetch(`/api/loans/my-loans/${userId}`);
      if (!res.ok) {
        return [];
      }
      const data = await res.json();
      return Array.isArray(data) ? data.map(loan => ({
          ...loan,
          id: loan._id // Map _id to id for frontend
      })) : [];
    } catch (error) {
      console.error('Error fetching borrowing history:', error);
      return [];
    }
  },

  // Get investments for a user (as lender)
  async getLendingHistory(userId) {
      try {
        const res = await fetch(`/api/investments/my-portfolio/${userId}`);
        if (!res.ok) {
          return [];
        }
        const data = await res.json();
        return Array.isArray(data) ? data.map(investment => ({
            ...investment,
            id: investment._id,
            date: investment.createdAt,
            projectName: investment.loanRequest?.purpose || 'Loan Investment',
            borrowerName: investment.loanRequest?.borrower?.name || 'Unknown',
            amount: investment.amountInvested
        })) : [];
      } catch (error) {
        console.error('Error fetching lending history:', error);
        return [];
      }
  },

  // Fund a loan
  async fundLoan(loanId, amount) {
      const userStr = localStorage.getItem('lendwise_user');
      if (!userStr) throw new Error("User not logged in");
      const user = JSON.parse(userStr);

      const res = await fetch('/api/investments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              lenderId: user._id, // Backed expects _id
              loanRequestId: loanId,
              amount: Number(amount)
          })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      return await res.json();
  }
};

