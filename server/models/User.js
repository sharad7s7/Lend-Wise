import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  simulatedAuthId: { // In place of real auth
    type: String,
    required: true,
    unique: true,
  },
  financialProfile: {
    monthlyIncome: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    savingsConfig: { type: Number, default: 0 },
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Self-employed', 'Unemployed'], default: 'Full-time' }
  },
  riskScore: {
    type: Number,
    default: 0, // 0-100
  },
  role: {
     type: String,
     enum: ['Student', 'Non-student', 'Lender', 'Admin', 'borrower', 'lender', 'admin'],
     default: 'Student'
  }
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

export default User;
