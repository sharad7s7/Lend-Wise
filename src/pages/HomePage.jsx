import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { loanService } from '../services/loanService';
import { borrowRequestService } from '../services/borrowRequestService';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeBorrows, setActiveBorrows] = useState(0);
  const [activeLends, setActiveLends] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          const [borrowingHistory, lendingHistory, myRequests] = await Promise.all([
            loanService.getBorrowingHistory(user.id).catch(() => []),
            loanService.getLendingHistory(user.id).catch(() => []),
            borrowRequestService.getUserRequests(user.id).catch(() => [])
          ]);
          
          // Calculate stats
          const activeBorrowing = borrowingHistory.filter(l => l.status === 'Active').length;
          const activeLending = lendingHistory.filter(l => l.status === 'Active').length;
          const completedLoans = [...borrowingHistory, ...lendingHistory].filter(l => l.status === 'Completed' || l.status === 'Repaid').length;
          
          setStats({
            activeBorrowing,
            activeLending,
            completedLoans
          });
          
          setActiveBorrows(
            activeBorrowing +
            myRequests.filter(r => r.status === 'Open').length
          );
          setActiveLends(activeLending);
        } catch (error) {
          console.error('Error loading home page data:', error);
          // Set defaults on error
          setStats({
            activeBorrowing: 0,
            activeLending: 0,
            completedLoans: 0
          });
          setActiveBorrows(0);
          setActiveLends(0);
        }
      }
    };
    
    loadData();
  }, [user]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student': return 'bg-primary-100 text-primary-800';
      case 'Lender': return 'bg-purple-100 text-purple-800';
      case 'Non-student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'text-gray-400';
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}!
        </h1>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user?.role)}`}>
            {user?.role}
          </span>
          {user?.isVerified && (
            <span className="text-sm text-green-600">✓ Verified</span>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Active Borrows</div>
          <div className="text-3xl font-bold text-primary-600">{activeBorrows}</div>
          <p className="text-xs text-gray-500 mt-1">Loans you're repaying</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">Active Lends</div>
          <div className="text-3xl font-bold text-purple-600">{activeLends}</div>
          <p className="text-xs text-gray-500 mt-1">Loans you've funded</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm font-semibold text-gray-600 mb-2">AI Credit Score</div>
          {user?.aiCreditScore ? (
            <>
              <div className={`text-3xl font-bold ${getScoreColor(user.aiCreditScore)}`}>
                {user.aiCreditScore}
              </div>
              <p className="text-xs text-gray-500 mt-1">Based on marketplace activity</p>
            </>
          ) : user?.socialTrustScore ? (
            <>
              <div className={`text-3xl font-bold text-primary-600`}>
                {user.socialTrustScore}
              </div>
              <p className="text-xs text-gray-500 mt-1">Social Trust Score</p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Complete your first transaction</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {user?.role !== 'Lender' && (
              <button
                onClick={() => navigate('/borrow')}
                className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700"
              >
                Request a Loan
              </button>
            )}
            <button
              onClick={() => navigate('/lend')}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700"
            >
              Lend Money
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300"
            >
              View Profile
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {stats && (stats.activeBorrowing > 0 || stats.activeLending > 0) ? (
            <div className="space-y-2 text-sm">
              {stats.activeBorrowing > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Borrows</span>
                  <span className="font-semibold">{stats.activeBorrowing}</span>
                </div>
              )}
              {stats.activeLending > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Lends</span>
                  <span className="font-semibold">{stats.activeLending}</span>
                </div>
              )}
              {stats.completedLoans > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Loans</span>
                  <span className="font-semibold">{stats.completedLoans}</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}

