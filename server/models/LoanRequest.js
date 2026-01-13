import mongoose from 'mongoose';

const loanRequestSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  interestRate: {
    type: Number,
    required: true,
  },
  durationMonths: {
    type: Number,
    required: true,
  },
  purpose: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Funded', 'Active', 'Repaid', 'Defaulted'],
    default: 'Pending',
  },
  riskTier: {
    type: String,
    enum: ['A', 'B', 'C', 'D'],
    default: 'C',
  },
  fundedAmount: {
    type: Number,
    default: 0,
  },
  certificateSubmitted: {
    type: Boolean,
    default: false,
  },
  certificateSubmissionDate: {
    type: Date,
    default: null,
  },
  certificateDeadline: {
    type: Date,
    default: null,
  },
  certificateData: {
    principal: { type: Number, default: 0 },
    interest: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    signedBy: { type: String, default: null },
    signedAt: { type: Date, default: null },
  }
}, {
  timestamps: true,
});

const LoanRequest = mongoose.model('LoanRequest', loanRequestSchema);

export default LoanRequest;
