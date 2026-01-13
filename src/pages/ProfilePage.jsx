import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { loanService } from '../services/loanService';
import { borrowRequestService } from '../services/borrowRequestService';
import { authService } from '../services/authService';

export default function ProfilePage() {
  const { user } = useAuth();
  const [borrowingHistory, setBorrowingHistory] = useState([]);
  const [lendingHistory, setLendingHistory] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [securityDepositInfo, setSecurityDepositInfo] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      if (user?.id) {
        try {
          const [borrowing, lending, requests] = await Promise.all([
            loanService.getBorrowingHistory(user.id).catch(() => []),
            loanService.getLendingHistory(user.id).catch(() => []),
            borrowRequestService.getUserRequests(user.id).catch(() => [])
          ]);
          
          setBorrowingHistory(borrowing || []);
          setLendingHistory(lending || []);
          setMyRequests(requests || []);
          
          // Get security deposit info from user object if available
          if (user.securityDeposit !== undefined) {
            setSecurityDepositInfo({
              totalDeposit: user.securityDeposit || 0,
              availableBalance: user.availableSecurityDeposit || user.securityDeposit || 0,
              deductedAmount: (user.securityDeposit || 0) - (user.availableSecurityDeposit || user.securityDeposit || 0),
              history: user.securityDepositHistory || []
            });
          }
        } catch (error) {
          console.error('Error loading profile data:', error);
          setBorrowingHistory([]);
          setLendingHistory([]);
          setMyRequests([]);
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

      {/* Security Deposit */}
      {securityDepositInfo && (user?.role !== 'Lender') && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-6 mb-8 border border-green-200">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🔐</span>
            Security Deposit
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <label className="text-sm font-semibold text-gray-600">Total Deposit</label>
              <div className="text-3xl font-bold text-green-600 mt-2">
                ${securityDepositInfo.totalDeposit?.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Initial security deposit</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <label className="text-sm font-semibold text-gray-600">Available Balance</label>
              <div className="text-3xl font-bold text-emerald-600 mt-2">
                ${securityDepositInfo.availableBalance?.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">Can be deducted if you default</p>
            </div>

            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <label className="text-sm font-semibold text-gray-600">Deducted Amount</label>
              <div className={`text-3xl font-bold mt-2 ${securityDepositInfo.deductedAmount > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                ${securityDepositInfo.deductedAmount?.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">From defaults or penalties</p>
            </div>
          </div>

          {/* Security Deposit History */}
          {securityDepositInfo.history && securityDepositInfo.history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-green-200">
              <h3 className="font-semibold text-gray-700 mb-3">Transaction History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {securityDepositInfo.history.map((transaction, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm bg-white p-3 rounded border border-gray-100">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg">
                        {transaction.type === 'deposit' && '💰'}
                        {transaction.type === 'deduction' && '⚠️'}
                        {transaction.type === 'refund' && '✅'}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-700 capitalize">{transaction.type}</p>
                        <p className="text-xs text-gray-500">{transaction.description}</p>
                        <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === 'deduction' ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.type === 'deduction' ? '-' : '+'} ${transaction.amount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Balance: ${transaction.balance?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Important:</strong> Your security deposit will be deducted if you fail to repay a loan within the deadline. Keep your available balance positive to protect your borrowing reputation.
            </p>
          </div>
        </div>
      )}
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
                  <tr key={loan.id || loan._id || loan.loanId} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{loan.id || loan._id || loan.loanId || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">${(loan.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">{loan.source || (loan.trustType === 'AI' ? 'AI Marketplace' : 'Friend Circle')}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status || 'Pending')}`}>
                        {loan.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">{(loan.interestRate || 0) > 0 ? `${loan.interestRate}%` : '0%'}</td>
                    <td className="py-3 px-4">{loan.createdAt || 'N/A'}</td>
                  </tr>
                ))}
                {myRequests.filter(r => r.status === 'Funded').map((request) => (
                  <tr key={request.requestId || request.id || request._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{request.requestId || request.id || request._id || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">${(request.amount || 0).toLocaleString()}</td>
                    <td className="py-3 px-4">AI Marketplace</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor('Active')}`}>
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4">{request.interestRate ? `${request.interestRate}%` : 'N/A'}</td>
                    <td className="py-3 px-4">{request.createdAt || 'N/A'}</td>
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
                    : Math.round(((loan.amount || 0) * (loan.interestRate || 0) / 100 * (loan.duration || 12)) / 12);
                  
                  return (
                    <tr key={loan.id || loan._id || loan.loanId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{loan.id || loan._id || loan.loanId || 'N/A'}</td>
                      <td className="py-3 px-4 font-semibold">${(loan.amount || 0).toLocaleString()}</td>
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
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(loan.status || 'Pending')}`}>
                          {loan.status || 'Pending'}
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
