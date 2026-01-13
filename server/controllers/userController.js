import User from '../models/User.js';
import { calculateRiskScore } from '../utils/aiEngine.js';
import mongoose from 'mongoose';

// Helper to check if DB is connected
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res.status(503).json({ message: 'Database not connected. Please check server configuration.' });
    }

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

// @desc    Login user (Simulated)
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        if (!isDBConnected()) {
            return res.status(503).json({ message: 'Database not connected. Please check server configuration.' });
        }

        const { email } = req.body;
        
        let user = await User.findOne({ email });

        // Auto-create demo users if they don't exist (for demo convenience)
        if (!user) {
            const demoUsers = {
                'student@university.edu': { name: 'Alex Johnson', role: 'Student' },
                'lender@example.com': { name: 'Sarah Lender', role: 'Lender' },
                'user@example.com': { name: 'John Smith', role: 'Non-student' }
            };

            if (demoUsers[email]) {
                try {
                    // Helper for base64 encoding (Node.js compatible)
                    const btoa = (str) => Buffer.from(str, 'binary').toString('base64');
                    user = await User.create({
                        name: demoUsers[email].name,
                        email: email,
                        simulatedAuthId: btoa(email),
                        role: demoUsers[email].role
                    });
                    console.log(`Auto-created demo user: ${email}`);
                } catch (createError) {
                    // If creation fails, try to find again (might have been created by another request)
                    user = await User.findOne({ email });
                    if (!user) {
                        return res.status(401).json({ message: 'Invalid email or user not found' });
                    }
                }
            } else {
                return res.status(401).json({ message: 'Invalid email or user not found. Please sign up first.' });
            }
        }

        // Return user with all necessary fields
        res.json({
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            simulatedAuthId: user.simulatedAuthId,
            riskScore: user.riskScore || 0,
            financialProfile: user.financialProfile || {},
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        });
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
