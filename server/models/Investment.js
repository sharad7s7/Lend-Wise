import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
  lender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  loanRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LoanRequest',
    required: true,
  },
  amountInvested: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Defaulted'],
    default: 'Active'
  }
}, {
  timestamps: true,
});

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
