import User from '../models/User.js';
import { calculateRiskScore } from '../utils/aiEngine.js';

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, simulatedAuthId, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      simulatedAuthId,
      role
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        simulatedAuthId: user.simulatedAuthId,
        role: user.role,
        riskScore: user.riskScore
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public (Simulated Auth)
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update financial profile & Recalculate AI Score
// @route   PUT /api/users/:id/financials
// @access  Public
export const updateFinancialProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.financialProfile = {
        ...user.financialProfile,
        ...req.body
      };
      
      // Trigger AI Engine
      const newScore = await calculateRiskScore(user);
      user.riskScore = newScore;

      const updatedUser = await user.save();
      
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
