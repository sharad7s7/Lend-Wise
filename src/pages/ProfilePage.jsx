import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { loanService } from '../services/loanService';
import { borrowRequestService } from '../services/borrowRequestService';

export default function ProfilePage() {
  const { user } = useAuth();
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [lendingHistory, setLendingHistory] = useState([]);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    if (user?.id) {
      const borrowing = loanService.getBorrowingHistory(user.id);
      const lending = loanService.getLendingHistory(user.id);
      const requests = borrowRequestService.getUserRequests(user.id);
      
      setBorrowingHistory(borrowing);
      setLendingHistory(lending);
      setMyRequests(requests);
    }
  }, [user]);

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student': return 'bg-primary-100 text-primary-800';
      case 'Lender': return 'bg-purple-100 text-purple-800';
      case 'Non-student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskCategory = () => {
    if (!user?.aiCreditScore) return 'Not Available';
    if (user.aiCreditScore >= 75) return 'Low Risk';
    if (user.aiCreditScore >= 60) return 'Medium Risk';
    return 'High Risk';
  };

  const getTrustTrend = () => {
    // Mock trend - in real app would calculate from history
    return 'Stable';
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

        {/* Trust Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Trust Summary</h2>
          <div className="space-y-4">
            {user?.role === 'Student' && user?.socialTrustScore !== null && (
              <div>
                <label className="text-sm font-semibold text-gray-600">Social Trust Score</label>
                <div className="text-3xl font-bold text-primary-600 mt-1">
                  {user.socialTrustScore}
                </div>
                <p className="text-xs text-gray-500 mt-1">Based on Friend Circle activity</p>
              </div>
            )}
            {(user?.role === 'Non-student' || user?.role === 'Lender') && user?.aiCreditScore !== null && (
              <>
                <div>
                  <label className="text-sm font-semibold text-gray-600">AI Credit Score</label>
                  <div className="text-3xl font-bold text-purple-600 mt-1">
                    {user.aiCreditScore}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Based on marketplace assessment</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Risk Category</label>
                  <p className="text-gray-900 font-medium mt-1">{getRiskCategory()}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Trust Trend</label>
                  <p className="text-gray-900 font-medium mt-1">{getTrustTrend()}</p>
                </div>
              </>
            )}
            {(!user?.socialTrustScore && !user?.aiCreditScore) && (
              <p className="text-gray-500">Complete your first transaction to see your trust score</p>
            )}
          </div>
        </div>
      </div>

      {/* Borrow History */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Borrow History</h2>
        {borrowingHistory.length === 0 && myRequests.filter(r => r.status === 'Funded').length === 0 ? (
          <p className="text-gray-500">No borrow history</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Loan ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Interest Rate</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Created Date</th>
                </tr>
              </thead>
              <tbody>
                {borrowingHistory.map((loan) => (
                  <tr key={loan.loanId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{loan.loanId}</td>
                    <td className="py-3 px-4 font-semibold">${loan.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">{loan.source || (loan.trustType === 'AI' ? 'AI Marketplace' : 'Friend Circle')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                        {loan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{loan.interestRate > 0 ? `${loan.interestRate}%` : '0%'}</td>
                    <td className="py-3 px-4">{loan.createdAt}</td>
                  </tr>
                ))}
                {myRequests.filter(r => r.status === 'Funded').map((request) => (
                  <tr key={request.requestId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{request.requestId}</td>
                    <td className="py-3 px-4 font-semibold">${request.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">AI Marketplace</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor('Active')}`}>
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">{request.interestRate ? `${request.interestRate}%` : 'N/A'}</td>
                    <td className="py-3 px-4">{request.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lend History */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Lend History</h2>
        {lendingHistory.length === 0 ? (
          <p className="text-gray-500">No lending history</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Loan ID</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount Lent</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Borrower</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expected Return</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {lendingHistory.map((loan) => {
                  const expectedReturn = loan.status === 'Completed' 
                    ? loan.interestPaid || 0
                    : Math.round((loan.amount * (loan.interestRate || 0) / 100 * (loan.duration || 12)) / 12);
                  
                  return (
                    <tr key={loan.loanId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{loan.loanId}</td>
                      <td className="py-3 px-4 font-semibold">${loan.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{loan.borrowerName || 'Anonymous'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          loan.riskLevel === 'Low' ? 'bg-green-100 text-green-800' :
                          loan.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {loan.riskLevel || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4">${expectedReturn.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status)}`}>
                          {loan.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}
