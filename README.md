# LendWise - AI-Powered Peer-to-Peer Lending Platform

An industry-ready FinTech prototype built with React.js and Tailwind CSS that demonstrates both social trust-based and AI-powered lending systems.

## Features

### Authentication & User Management
- **Login & Signup**: Email + password authentication with role selection
- **User Roles**: Student, Non-student, Lender
- **Student Verification**: Optional .edu email verification for students
- **User Profiles**: Personal details, role badges, trust summaries

### Two Lending Modes

1. **Friend Circle Lending (Social Trust - Students Only)**
   - Create and manage friend circles
   - Invite members via email
   - One-tap lending among known users
   - No contracts, no interest by default
   - Social trust monitoring with personal and circle trust scores
   - Repayment streaks and trust decay system
   - Loan purpose tags (Food, Books, Travel, Emergency)
   - Loan caps and safety controls
   - Circle health monitoring

2. **AI Marketplace Lending (AI Trust - All Users)**
   - Comprehensive credit assessment form
   - Advanced inputs: income consistency, expenses, existing obligations
   - AI-powered credit scoring (0-100)
   - Risk categorization (Low/Medium/High)
   - Default probability calculation
   - Dynamic interest rate pricing with breakdown
   - Explainable AI analysis panel
   - Factor contribution visualization
   - Confidence scores for AI decisions

### Lender Dashboard
- Portfolio overview with expected returns
- Risk distribution analysis
- Social vs AI trust exposure
- Smart filters (risk tolerance, interest range, trust type, duration)
- AI insights and portfolio alerts
- Overexposure warnings
- Diversification suggestions

### Additional Features
- **Notifications System**: Repayment reminders, risk alerts, trust score changes
- **Activity Logs**: Track loans, payments, trust updates
- **Admin Panel**: Platform metrics, default rates, user breakdown, system health
- **Route Protection**: Role-based access control
- **Global State Management**: Context API for auth and user state

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Demo Accounts

- **Student**: student@university.edu / password123
- **Lender**: lender@example.com / password123
- **Non-student**: user@example.com / password123

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
lendwise/
├── src/
│   ├── pages/
│   │   ├── LandingPage.jsx          # Home page with mode selection
│   │   ├── LoginPage.jsx            # Authentication
│   │   ├── SignupPage.jsx           # User registration
│   │   ├── FriendCirclePage.jsx     # Enhanced Friend Circle (students)
│   │   ├── ProfilePage.jsx          # User profile
│   │   └── AdminPage.jsx            # Admin dashboard
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.jsx           # Main layout with navigation
│   │   │   ├── ProtectedRoute.jsx   # Route protection
│   │   │   └── NotificationCenter.jsx # Notifications UI
│   │   ├── OpenMarketplace.jsx      # AI marketplace lending
│   │   └── LenderDashboard.jsx     # Lender portfolio
│   ├── services/
│   │   ├── authService.js           # Authentication logic
│   │   ├── circleService.js         # Friend circle management
│   │   └── notificationService.js   # Notifications system
│   ├── hooks/
│   │   ├── useAuth.js               # Authentication hook
│   │   └── useNotifications.js      # Notifications hook
│   ├── context/
│   │   └── AppContext.jsx           # Global state management
│   ├── utils/
│   │   └── aiEngine.js              # AI credit assessment logic
│   ├── mockData/
│   │   └── circles.js               # Mock circle data
│   ├── App.jsx                      # Main app with routing
│   ├── main.jsx                     # Entry point
│   └── index.css                    # Tailwind CSS imports
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Technology Stack

- **React.js** - UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and dev server
- **Context API** - Global state management

## Architecture

### Separation of Concerns
- **Pages**: Route-level components
- **Components**: Reusable UI components
- **Services**: Business logic and data management
- **Hooks**: Custom React hooks for shared logic
- **Context**: Global application state
- **Utils**: Pure utility functions

### State Management
- Global state via Context API for:
  - Authentication state
  - User role and profile
  - Active mode (Friend Circle / Marketplace)

### Route Protection
- Role-based access control
- Students can access Friend Circle
- All users can access AI Marketplace
- Lenders see lender dashboard

## Key Features Explained

### AI Credit Assessment Engine

The AI engine (`src/utils/aiEngine.js`) provides realistic credit scoring using:
- Income stability analysis
- Loan-to-income ratio calculations
- Employment type risk multipliers
- Repayment behavior scoring
- Weighted credit score (0-100)
- Default probability estimation
- Dynamic interest rate pricing
- Comprehensive explainability

### Social Trust Engine

The trust system (`src/services/circleService.js`) manages:
- Personal trust scores based on repayment history
- Circle trust scores from member behavior
- Repayment streaks and decay
- Trust badge assignment (Good/Average/Risky)
- Loan caps and safety controls

### Mock Data

The application uses simulated data stored in localStorage:
- Friend circles with members and trust scores
- Borrower profiles from both lending modes
- Historical repayment data
- User authentication (mock backend)

## Usage

1. **Sign Up/Login**: Create an account or use demo credentials
2. **Choose Your Role**: Student, Non-student, or Lender
3. **Friend Circle (Students)**: Create circles, invite friends, lend/borrow
4. **AI Marketplace (All)**: Get credit assessment, view AI analysis
5. **Lender Dashboard (Lenders)**: View portfolio, filter borrowers, see insights
6. **Profile**: View your trust scores and personal information
7. **Admin**: View platform metrics and system health

## Notes

- All data is simulated and stored in localStorage
- The AI engine uses weighted algorithms to provide realistic assessments
- UI clearly distinguishes between social trust and AI trust modes
- All financial decisions include explanations
- Authentication is mocked (no real backend)
- Data persists in browser localStorage

## Future Enhancements

- Real backend API integration
- Machine learning model integration
- Real-time notifications
- Payment processing
- Advanced analytics
- Mobile app
