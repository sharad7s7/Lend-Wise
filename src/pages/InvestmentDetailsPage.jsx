import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { loanService } from '../services/loanService';

export default function InvestmentDetailsPage() {
  const navigate = useNavigate();
  const { loanId } = useParams();
  const { user } = useAuth();
  const [loan, setLoan] = useState(null);

  useEffect(() => {
    if (loanId && user?.id) {
      const lendingHistory = loanService.getLendingHistory(user.id);
      const foundLoan = lendingHistory.find(l => l.loanId === loanId);
      setLoan(foundLoan);
    }
  }, [loanId, user]);

  if (!loan) {
    return (
      <ProtectedRoute requiredAccess="dashboard">
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <p className="text-gray-500">Investment not found</p>
              <button
                onClick={() => navigate('/marketplace/investments')}
                className="mt-4 text-purple-600 hover:text-purple-700"
              >
                Back to My Investments
              </button>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Defaulted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMonitoringColor = (status) => {
    switch (status) {
      case 'Stable': return 'bg-green-100 text-green-800';
      case 'Watch': return 'bg-yellow-100 text-yellow-800';
      case 'High Risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateMonthlyPayment = () => {
    if (!loan.interestRate || loan.interestRate === 0) {
      return loan.amount / (loan.duration || 12);
    }
    const monthlyRate = loan.interestRate / 100 / 12;
    const numPayments = loan.duration || 12;
    const payment = (loan.amount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
    return Math.round(payment);
  };

  const generateRepaymentSchedule = () => {
    const schedule = [];
    const monthlyPayment = calculateMonthlyPayment();
    let remainingBalance = loan.amount;
    const monthlyRate = (loan.interestRate || 0) / 100 / 12;
    const numPayments = loan.duration || 12;

    for (let i = 1; i <= numPayments; i++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingBalance -= principalPayment;

      schedule.push({
        payment: i,
        date: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        total: monthlyPayment,
        remaining: Math.max(0, Math.round(remainingBalance)),
      });
    }

    return schedule;
  };

  const repaymentSchedule = generateRepaymentSchedule();

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/marketplace/investments')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to My Investments
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Investment Details</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Borrower Info */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Borrower Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Borrower</label>
                <p className="text-gray-900 font-medium">{loan.borrowerName || 'Anonymous'}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Loan Amount</label>
                <p className="text-gray-900 font-medium">${loan.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Interest Rate</label>
                <p className="text-gray-900 font-medium">{loan.interestRate}%</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Duration</label>
                <p className="text-gray-900 font-medium">{loan.duration} months</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(loan.status)}`}>
                  {loan.status}
                </span>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Trust Type</label>
                <p className="text-gray-900 font-medium">{loan.trustType === 'AI' ? 'AI Verified' : 'Social Trust'}</p>
              </div>
            </div>
          </div>

          {/* Risk Factors at Approval */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Factors at Approval</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Risk Level</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(loan.riskLevel)}`}>
                  {loan.riskLevel}
                </span>
              </div>
              {loan.creditScore && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Credit Score</span>
                  <span className="font-semibold">{loan.creditScore}/100</span>
                </div>
              )}
              {loan.defaultProbability && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Default Probability</span>
                  <span className="font-semibold">{loan.defaultProbability}%</span>
                </div>
              )}
              {loan.aiRecommendation && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Recommendation</span>
                  <span className="font-semibold">{loan.aiRecommendation}</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Monitoring Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Monitoring Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMonitoringColor(loan.riskMonitoring || 'Stable')}`}>
                  {loan.riskMonitoring || 'Stable'}
                </span>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Ongoing AI Monitoring:</strong> This investment is continuously monitored by AI systems 
                  to track repayment behavior, detect early warning signs, and ensure your funds are protected.
                </p>
              </div>
            </div>
          </div>

          {/* Repayment Schedule */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Repayment Schedule</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3">Payment #</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-right py-2 px-3">Principal</th>
                    <th className="text-right py-2 px-3">Interest</th>
                    <th className="text-right py-2 px-3">Total</th>
                    <th className="text-right py-2 px-3">Remaining</th>
                  </tr>
                </thead>
                <tbody>
                  {repaymentSchedule.map((payment) => (
                    <tr key={payment.payment} className="border-b border-gray-100">
                      <td className="py-2 px-3">{payment.payment}</td>
                      <td className="py-2 px-3">{payment.date}</td>
                      <td className="text-right py-2 px-3">${payment.principal.toLocaleString()}</td>
                      <td className="text-right py-2 px-3">${payment.interest.toLocaleString()}</td>
                      <td className="text-right py-2 px-3 font-semibold">${payment.total.toLocaleString()}</td>
                      <td className="text-right py-2 px-3">${payment.remaining.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Security & Trust */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Security & Trust</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Funds Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Ongoing AI Monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Transparent Repayment Tracking</span>
              </div>
              {loan.fraudScreeningStatus && (
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Fraud Screening</div>
                  <div className="text-sm font-semibold text-green-600">{loan.fraudScreeningStatus}</div>
                </div>
              )}
              {loan.incomeConsistency && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Income Verification</div>
                  <div className="text-sm font-semibold text-green-600">{loan.incomeConsistency}</div>
                </div>
              )}
            </div>
          </div>

          {/* Loan Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Loan Timeline</h2>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="text-sm font-semibold">{loan.createdAt}</div>
              </div>
              {loan.completedAt && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Completed</div>
                  <div className="text-sm font-semibold">{loan.completedAt}</div>
                </div>
              )}
              {loan.status === 'Active' && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Expected Completion</div>
                  <div className="text-sm font-semibold">
                    {new Date(Date.now() + (loan.duration || 12) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expected Returns */}
          <div className="bg-purple-50 rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-xl font-semibold mb-4">Expected Returns</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Principal</span>
                <span className="font-semibold">${loan.amount.toLocaleString()}</span>
              </div>
              {loan.status === 'Completed' && loan.interestPaid > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Interest Earned</span>
                  <span className="font-semibold text-green-600">${loan.interestPaid.toLocaleString()}</span>
                </div>
              )}
              {loan.status === 'Active' && loan.interestRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expected Interest</span>
                  <span className="font-semibold text-purple-600">
                    ${Math.round((loan.amount * loan.interestRate / 100 * (loan.duration || 12)) / 12).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-purple-200">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Expected</span>
                  <span className="font-bold text-lg text-purple-600">
                    ${loan.status === 'Completed' 
                      ? (loan.amount + (loan.interestPaid || 0)).toLocaleString()
                      : (loan.amount + Math.round((loan.amount * loan.interestRate / 100 * (loan.duration || 12)) / 12)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredAccess="dashboard">
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}

