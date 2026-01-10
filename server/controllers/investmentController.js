import Investment from '../models/Investment.js';
import LoanRequest from '../models/LoanRequest.js';
import Transaction from '../models/Transaction.js';

// @desc    Fund a loan
// @route   POST /api/investments
// @access  Public
export const createInvestment = async (req, res) => {
  try {
    const { lenderId, loanRequestId, amount } = req.body;

    const loan = await LoanRequest.findById(loanRequestId);
    if (!loan) {
        return res.status(404).json({ message: 'Loan request not found' });
    }

    if (loan.status !== 'Pending') {
        return res.status(400).json({ message: 'Loan is not available for funding' });
    }

    if (loan.fundedAmount + amount > loan.amount) {
        return res.status(400).json({ message: 'Investment exceeds requested amount' });
    }

    // Create Investment
    const investment = await Investment.create({
        lender: lenderId,
        loanRequest: loanRequestId,
        amountInvested: amount
    });

    // Update Loan Funded Amount
    loan.fundedAmount += amount;
    if (loan.fundedAmount >= loan.amount) {
        loan.status = 'Funded';
    }
    await loan.save();

    // Create Transaction Record (Deduction from Lender)
    await Transaction.create({
        user: lenderId,
        type: 'Investment',
        amount: -amount,
        description: `Investment in Loan #${loanRequestId}`
    });

    res.status(201).json(investment);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lender's portfolio
// @route   GET /api/investments/my-portfolio/:userId
// @access  Public
export const getLenderPortfolio = async (req, res) => {
  try {
    const investments = await Investment.find({ lender: req.params.userId })
        .populate({
            path: 'loanRequest',
            populate: { path: 'borrower', select: 'name' }
        });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
