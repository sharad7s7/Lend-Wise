import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { loanService } from '../services/loanService';

export default function ProfilePage() {
  const { user } = useAuth();
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [lendingHistory, setLendingHistory] = useState([]);
  const [loanStats, setLoanStats] = useState(null);
  const [expandedLoan, setExpandedLoan] = useState(null);

  useEffect(() => {
    if (user?.id) {
      const borrowing = loanService.getBorrowingHistory(user.id);
      const lending = loanService.getLendingHistory(user.id);
      const stats = loanService.getLoanStats(user.id);
      
      setBorrowingHistory(borrowing);
      setLendingHistory(lending);
      setLoanStats(stats);
    }
  }, [user]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student': return 'bg-primary-100 text-primary-800';
      case 'Lender': return 'bg-purple-100 text-purple-800';
      case 'Non-student': return 'bg-gray-100 text-gray-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustTypeLabel = (trustType) => {
    return trustType === 'Social' ? 'Social Trust Loan' : 'AI-Assessed Loan';
  };

  const getTrustTrend = () => {
    if (!user?.socialTrustScore && !user?.aiCreditScore) return null;
    // Mock trend - in real app would calculate from history
    return 'stable';
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Profile</h1>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-semibold">
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Name</label>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Email</label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Role</label>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role}
                </span>
                {user?.isVerified && (
                  <span className="ml-2 text-xs text-green-600">✓ Verified</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trust & Credit Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Trust & Credit Summary</h2>
          <div className="space-y-4">
            {user?.role === 'Student' && user?.socialTrustScore !== null && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Social Trust Score</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-3xl font-bold text-primary-600">
                    {user.socialTrustScore}
                  </div>
                  {getTrustTrend() && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      getTrustTrend() === 'improving' ? 'bg-green-100 text-green-800' :
                      getTrustTrend() === 'declining' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getTrustTrend() === 'improving' ? '↑ Improving' :
                       getTrustTrend() === 'declining' ? '↓ Declining' : '→ Stable'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on Friend Circle activity</p>
              </div>
            )}
            {(user?.role === 'Non-student' || user?.role === 'Lender') && user?.aiCreditScore !== null && (
              <div>
                <label className="text-sm font-semibold text-gray-600">AI Credit Score</label>
                <div className="flex items-center gap-3 mt-1">
                  <div className="text-3xl font-bold text-purple-600">
                    {user.aiCreditScore}
                  </div>
                  {getTrustTrend() && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      getTrustTrend() === 'improving' ? 'bg-green-100 text-green-800' :
                      getTrustTrend() === 'declining' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getTrustTrend() === 'improving' ? '↑ Improving' :
                       getTrustTrend() === 'declining' ? '↓ Declining' : '→ Stable'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on marketplace assessment</p>
              </div>
            )}
            {(!user?.socialTrustScore && !user?.aiCreditScore) && (
              <p className="text-gray-500">Complete your first transaction to see your trust score</p>
            )}
          </div>
        </div>
      </div>

      {/* Borrowing History */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Borrowing History</h2>
        {borrowingHistory.length === 0 ? (
          <p className="text-gray-500">You haven't borrowed any money yet.</p>
        ) : (
          <div className="space-y-4">
            {borrowingHistory.map((loan) => (
              <div
                key={loan.loanId}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        ${loan.amount.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTrustTypeLabel(loan.trustType)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>From: {loan.lenderName}</span>
                      {loan.interestRate > 0 && (
                        <span className="ml-4">Interest: {loan.interestRate}%</span>
                      )}
                      {loan.interestPaid > 0 && (
                        <span className="ml-4">Interest Paid: ${loan.interestPaid.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {loan.createdAt}
                      {loan.completedAt && ` • Completed: ${loan.completedAt}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedLoan(expandedLoan === loan.loanId ? null : loan.loanId)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                  >
                    {expandedLoan === loan.loanId ? 'Hide' : 'Details'}
                  </button>
                </div>
                {expandedLoan === loan.loanId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Source:</span> {loan.source}
                      </div>
                      <div>
                        <span className="font-semibold">Risk Level:</span> {loan.riskLevel}
                      </div>
                      <div>
                        <span className="font-semibold">Loan ID:</span> {loan.loanId}
                      </div>
                      <div>
                        <span className="font-semibold">Trust Type:</span> {loan.trustType}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {loanStats && borrowingHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Borrowed:</span>
                <span className="ml-2 font-semibold">${loanStats.totalBorrowed.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Active Loans:</span>
                <span className="ml-2 font-semibold">{loanStats.activeBorrowing}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Interest Paid:</span>
                <span className="ml-2 font-semibold">${loanStats.totalInterestPaid.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Lending History */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Lending History</h2>
        {lendingHistory.length === 0 ? (
          <p className="text-gray-500">You haven't lent any money yet.</p>
        ) : (
          <div className="space-y-4">
            {lendingHistory.map((loan) => (
              <div
                key={loan.loanId}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-gray-900">
                        ${loan.amount.toLocaleString()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTrustTypeLabel(loan.trustType)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span>To: {loan.borrowerName}</span>
                      {loan.interestRate > 0 && (
                        <span className="ml-4">Interest: {loan.interestRate}%</span>
                      )}
                      {loan.interestPaid > 0 && (
                        <span className="ml-4">Returns: ${loan.interestPaid.toLocaleString()}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {loan.createdAt}
                      {loan.completedAt && ` • Completed: ${loan.completedAt}`}
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedLoan(expandedLoan === loan.loanId ? null : loan.loanId)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                  >
                    {expandedLoan === loan.loanId ? 'Hide' : 'Details'}
                  </button>
                </div>
                {expandedLoan === loan.loanId && (
                  <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-semibold">Source:</span> {loan.source}
                      </div>
                      <div>
                        <span className="font-semibold">Risk Level at Lending:</span> {loan.riskLevel}
                      </div>
                      <div>
                        <span className="font-semibold">Loan ID:</span> {loan.loanId}
                      </div>
                      <div>
                        <span className="font-semibold">Trust Type:</span> {loan.trustType}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {loanStats && lendingHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Lent:</span>
                <span className="ml-2 font-semibold">${loanStats.totalLent.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Active Loans:</span>
                <span className="ml-2 font-semibold">{loanStats.activeLending}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Returns Earned:</span>
                <span className="ml-2 font-semibold">${loanStats.totalReturnsEarned.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role-Based Summary */}
      {user?.role === 'Student' && (
        <div className="bg-primary-50 rounded-xl shadow-lg p-6 border border-primary-200">
          <h2 className="text-xl font-semibold mb-4">Friend Circle Summary</h2>
          <p className="text-gray-700">
            Your social trust score reflects your reliability within friend circles. 
            Maintain good repayment behavior to keep your score high.
          </p>
        </div>
      )}

      {user?.role === 'Lender' && (
        <div className="bg-purple-50 rounded-xl shadow-lg p-6 border border-purple-200">
          <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
          {loanStats && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Completed Loans:</span>
                <span className="ml-2 font-semibold">{loanStats.completedLoans}</span>
              </div>
              <div>
                <span className="text-gray-600">Defaulted Loans:</span>
                <span className="ml-2 font-semibold text-red-600">{loanStats.defaultedLoans}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}
