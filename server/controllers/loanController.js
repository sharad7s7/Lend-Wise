import LoanRequest from '../models/LoanRequest.js';
import User from '../models/User.js';
import { assignRiskTier, calculateRiskScore } from '../utils/aiEngine.js';
import mongoose from 'mongoose';

// Helper to check if DB is connected
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc    Create a loan request
// @route   POST /api/loans
// @access  Public
export const createLoanRequest = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ message: 'Database not connected. Please check server configuration.' });
    }

    const { borrowerId, amount, durationMonths, purpose } = req.body;

    if (!borrowerId || !amount || !durationMonths) {
      return res.status(400).json({ message: 'Missing required fields: borrowerId, amount, durationMonths' });
    }

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
        purpose: purpose || 'General',
        interestRate,
        riskTier,
        status: 'Pending'
    });

    res.status(201).json({
      _id: loan._id,
      id: loan._id,
      borrower: loan.borrower,
      amount: loan.amount,
      durationMonths: loan.durationMonths,
      purpose: loan.purpose,
      interestRate: loan.interestRate,
      riskTier: loan.riskTier,
      status: loan.status || 'Pending',
      createdAt: loan.createdAt,
      updatedAt: loan.updatedAt
    });

  } catch (error) {
    console.error('Error creating loan request:', error);
    res.status(500).json({ message: error.message || 'Failed to create loan request' });
  }
};

// @desc    Get all open loan requests (Explore)
// @route   GET /api/loans/explore
// @access  Public
export const getExploreLoans = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ message: 'Database not connected. Please check server configuration.' });
    }

    const loans = await LoanRequest.find({ status: 'Pending' })
        .populate('borrower', 'name riskScore')
        .sort({ createdAt: -1 });
    res.json(loans || []);
  } catch (error) {
    console.error('Error fetching explore loans:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch loans' });
  }
};

// @desc    Get loans for a specific borrower
// @route   GET /api/loans/my-loans/:userId
// @access  Public
export const getMyLoans = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ message: 'Database not connected. Please check server configuration.' });
    }

    const loans = await LoanRequest.find({ borrower: req.params.userId })
        .sort({ createdAt: -1 });
    res.json(loans || []);
  } catch (error) {
    console.error('Error fetching user loans:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch loans' });
  }
};

// @desc    Submit certificate for a loan
// @route   PUT /api/loans/:loanId/certificate
// @access  Public
export const submitCertificate = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ message: 'Database not connected. Please check server configuration.' });
    }

    const { loanId } = req.params;
    const { principal, interest, total, signedBy } = req.body;

    const loan = await LoanRequest.findById(loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Only allow certificate submission for funded loans
    if (loan.status !== 'Funded' && loan.status !== 'Active') {
      return res.status(400).json({ message: 'Certificate can only be submitted for funded loans' });
    }

    // Update loan with certificate data
    loan.certificateSubmitted = true;
    loan.certificateSubmissionDate = new Date();
    loan.certificateDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    loan.certificateData = {
      principal: principal || loan.amount,
      interest: interest || 0,
      total: total || loan.amount,
      signedBy: signedBy || 'Borrower',
      signedAt: new Date(),
    };

    // Update status to Active if it was Funded
    if (loan.status === 'Funded') {
      loan.status = 'Active';
    }

    await loan.save();

    res.json({
      _id: loan._id,
      id: loan._id,
      certificateSubmitted: loan.certificateSubmitted,
      certificateSubmissionDate: loan.certificateSubmissionDate,
      certificateDeadline: loan.certificateDeadline,
      certificateData: loan.certificateData,
      status: loan.status,
    });
  } catch (error) {
    console.error('Error submitting certificate:', error);
    res.status(500).json({ message: error.message || 'Failed to submit certificate' });
  }
};
