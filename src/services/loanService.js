export const loanService = {
  
  // Get loans for a user (as borrower)
  async getBorrowingHistory(userId) {
    const res = await fetch(`/api/loans/my-loans/${userId}`);
    const data = await res.json();
    return data.map(loan => ({
        ...loan,
        id: loan._id // Map _id to id for frontend
    }));
  },

  // Get investments for a user (as lender)
  async getLendingHistory(userId) {
      const res = await fetch(`/api/investments/my-portfolio/${userId}`);
      const data = await res.json();
      return data.map(investment => ({
          ...investment,
          id: investment._id,
          date: investment.createdAt,
          projectName: investment.loanRequest?.purpose || 'Loan Investment',
          borrowerName: investment.loanRequest?.borrower?.name || 'Unknown',
          amount: investment.amountInvested
      }));
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

