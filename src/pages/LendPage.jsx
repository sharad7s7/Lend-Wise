import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { borrowRequestService } from '../services/borrowRequestService';
import { loanService } from '../services/loanService';
import { assessCredit } from '../utils/aiEngine';
import { notificationService } from '../services/notificationService';

export default function LendPage() {
  const { user } = useAuth();
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (user?.id) {
      const requests = borrowRequestService.getOpenRequests(user.id);
      setBorrowRequests(requests);
    }
  }, [user]);

  const handleFundLoan = (request) => {
    // Get AI assessment if not already available
    let assessment = request.creditScore 
      ? {
          creditScore: request.creditScore,
          riskCategory: request.riskLevel,
          interestRate: request.suggestedInterestRate,
          defaultProbability: request.defaultProbability,
        }
      : assessCredit({
          monthlyIncome: request.monthlyIncome || 3000,
          employmentType: 'Salaried',
          loanAmount: request.amount,
          duration: request.duration,
          repaymentBehavior: 'Average',
        });

    // Fund the request (updates request status)
    const fundedRequest = borrowRequestService.fundRequest(
      request.requestId,
      user.id,
      user.name,
      assessment.interestRate || 10,
      assessment.riskCategory || 'Medium',
      assessment.creditScore || 70,
      assessment.defaultProbability || 20
    );

    // Create loan from funded request (appears in both borrower and lender history)
    const loan = loanService.createLoan({
      borrowerId: request.borrowerId,
      borrowerName: request.borrowerName,
      lenderId: user.id,
      lenderName: user.name,
      trustType: 'AI',
      amount: request.amount,
      interestRate: assessment.interestRate || 10,
      riskLevel: assessment.riskCategory || 'Medium',
      duration: request.duration,
      source: 'AI Marketplace',
      purpose: request.purpose,
      creditScore: assessment.creditScore || 70,
      defaultProbability: assessment.defaultProbability || 20,
      aiRecommendation: (assessment.creditScore || 70) >= 70 ? 'Approve' : 'Conditional',
      fraudScreeningStatus: 'Cleared',
      incomeConsistency: request.monthlyIncome ? 'Verified' : 'Pending',
      riskMonitoring: 'Stable',
      status: 'Active',
    });

    // Update UI - remove funded request from list
    setBorrowRequests(borrowRequests.filter(r => r.requestId !== request.requestId));

    notificationService.add({
      title: 'Loan Funded',
      message: `You've funded ${request.borrowerName}'s loan of $${request.amount.toLocaleString()}`,
      type: 'success',
    });
  };

  const filteredRequests = borrowRequests.filter(req => {
    if (filter === 'All') return true;
    if (filter === 'Low Risk') return req.riskLevel === 'Low';
    if (filter === 'Medium Risk') return req.riskLevel === 'Medium';
    if (filter === 'High Risk') return req.riskLevel === 'High';
    return true;
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Lend</h1>
          <p className="text-gray-600">Browse and fund loan requests from borrowers</p>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mr-2">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="All">All Requests</option>
            <option value="Low Risk">Low Risk</option>
            <option value="Medium Risk">Medium Risk</option>
            <option value="High Risk">High Risk</option>
          </select>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg text-gray-600 mb-2">No borrow requests available</p>
          <p className="text-sm text-gray-500">Check back later for new opportunities</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((request) => {
            const aiExplanation = request.creditScore 
              ? `Credit score: ${request.creditScore}/100. ${request.riskLevel} risk profile.`
              : 'AI assessment pending. Income verification recommended.';

            return (
              <div
                key={request.requestId}
                className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-purple-300 transition-all"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.borrowerName || 'Anonymous Borrower'}
                    </h3>
                    {request.riskLevel && (
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(request.riskLevel)}`}>
                        {request.riskLevel}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    ${request.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {request.duration} months • {request.purpose}
                  </div>
                </div>

                {request.suggestedInterestRate && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Suggested Interest Rate</div>
                    <div className="text-xl font-bold text-purple-600">
                      {request.suggestedInterestRate}%
                    </div>
                  </div>
                )}

                {request.creditScore && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">AI Credit Score</div>
                    <div className="text-lg font-semibold">
                      {request.creditScore}/100
                    </div>
                  </div>
                )}

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-700">{aiExplanation}</p>
                </div>

                <button
                  onClick={() => handleFundLoan(request)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold"
                >
                  Fund Loan
                </button>
              </div>
            );
          })}
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

