import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lendwise';
    await mongoose.connect(mongoURI);
    console.log('MongoDB Connected for seeding...');

    // Helper function for base64 encoding (Node.js compatible)
    const btoa = (str) => Buffer.from(str, 'binary').toString('base64');

    // Demo users
    const demoUsers = [
      {
        name: 'Alex Johnson',
        email: 'student@university.edu',
        simulatedAuthId: btoa('student@university.edu'),
        role: 'Student',
      },
      {
        name: 'Sarah Lender',
        email: 'lender@example.com',
        simulatedAuthId: btoa('lender@example.com'),
        role: 'Lender',
      },
      {
        name: 'John Smith',
        email: 'user@example.com',
        simulatedAuthId: btoa('user@example.com'),
        role: 'Non-student',
      },
    ];

    for (const userData of demoUsers) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = await User.create(userData);
        console.log(`✓ Created user: ${user.email} (${user.role})`);
      } else {
        console.log(`- User already exists: ${userData.email}`);
      }
    }

    console.log('\n✓ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
