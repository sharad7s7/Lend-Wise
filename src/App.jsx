import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import FriendCirclePage from './pages/FriendCirclePage';
import OpenMarketplace from './components/OpenMarketplace';
import LenderDashboard from './components/LenderDashboard';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import BorrowPage from './pages/BorrowPage';
import LendPage from './pages/LendPage';
import MyInvestmentsPage from './pages/MyInvestmentsPage';
import ExploreBorrowersPage from './pages/ExploreBorrowersPage';
import InvestmentDetailsPage from './pages/InvestmentDetailsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/borrow" 
            element={
              <ProtectedRoute>
                <BorrowPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/lend" 
            element={
              <ProtectedRoute>
                <LendPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/friend-circle" 
            element={
              <ProtectedRoute requiredAccess="friend-circle">
                <FriendCirclePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace" 
            element={
              <ProtectedRoute requiredAccess="marketplace">
                <OpenMarketplace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredAccess="dashboard">
                <LenderDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredAccess="admin">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace/investments" 
            element={
              <ProtectedRoute requiredAccess="dashboard">
                <MyInvestmentsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace/explore" 
            element={
              <ProtectedRoute requiredAccess="dashboard">
                <ExploreBorrowersPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/marketplace/investment/:loanId" 
            element={
              <ProtectedRoute requiredAccess="dashboard">
                <InvestmentDetailsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
