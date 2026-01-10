import LoanRequest from '../models/LoanRequest.js';
import User from '../models/User.js';
import { assignRiskTier, calculateRiskScore } from '../utils/aiEngine.js';

// @desc    Create a loan request
// @route   POST /api/loans
// @access  Public
export const createLoanRequest = async (req, res) => {
  try {
    const { borrowerId, amount, durationMonths, purpose } = req.body;

    const borrower = await User.findById(borrowerId);
    if (!borrower) {
        return res.status(404).json({ message: 'Borrower not found' });
    }

    // AI Logic: Refresh User Score then Tier the Loan
    const currentScore = await calculateRiskScore(borrower);
    // Persist latest score
    borrower.riskScore = currentScore;
    await borrower.save();

    const riskTier = assignRiskTier(currentScore);
    
    // Determine Interest Rate based on Tier (Simple heuristic for now)
    let interestRate;
    switch (riskTier) {
        case 'A': interestRate = 8; break;
        case 'B': interestRate = 12; break;
        case 'C': interestRate = 18; break;
        case 'D': interestRate = 24; break;
        default: interestRate = 15;
    }

    const loan = await LoanRequest.create({
        borrower: borrowerId,
        amount,
        durationMonths,
        purpose,
        interestRate,
        riskTier
    });

    res.status(201).json(loan);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all open loan requests (Explore)
// @route   GET /api/loans/explore
// @access  Public
export const getExploreLoans = async (req, res) => {
  try {
    const loans = await LoanRequest.find({ status: 'Pending' })
        .populate('borrower', 'name riskScore')
        .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get loans for a specific borrower
// @route   GET /api/loans/my-loans/:userId
// @access  Public
export const getMyLoans = async (req, res) => {
  try {
    const loans = await LoanRequest.find({ borrower: req.params.userId })
        .sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
