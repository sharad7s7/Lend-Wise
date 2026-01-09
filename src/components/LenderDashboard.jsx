import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockBorrowers } from '../utils/mockData';
import Layout from './common/Layout';

export default function LenderDashboard() {
  const navigate = useNavigate();
  const [borrowers] = useState(mockBorrowers);
  const [filter, setFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');

  const filteredBorrowers = borrowers.filter(borrower => {
    const trustMatch = filter === 'All' || borrower.trustType === filter;
    const riskMatch = riskFilter === 'All' || borrower.riskLevel === riskFilter;
    return trustMatch && riskMatch;
  });

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustTypeColor = (type) => {
    return type === 'Social' 
      ? 'bg-primary-100 text-primary-800'
      : 'bg-purple-100 text-purple-800';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'Approve':
      case 'Trusted': return 'bg-green-100 text-green-800';
      case 'Conditional': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: borrowers.length,
    social: borrowers.filter(b => b.trustType === 'Social').length,
    ai: borrowers.filter(b => b.trustType === 'AI').length,
    active: borrowers.filter(b => b.status === 'Active').length,
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-700 mb-4 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Lender Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your lending portfolio</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">Total Borrowers</div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">Social Trust</div>
            <div className="text-3xl font-bold text-primary-600">{stats.social}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">AI Verified</div>
            <div className="text-3xl font-bold text-purple-600">{stats.ai}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-sm font-semibold text-gray-600 mb-1">Active Loans</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trust Type</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="All">All Types</option>
                <option value="Social">Social Trust</option>
                <option value="AI">AI Verified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="All">All Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>
          </div>
        </div>

        {/* Borrowers List */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Borrowers</h2>
          
          {filteredBorrowers.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No borrowers match the selected filters
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBorrowers.map((borrower) => (
                <div
                  key={borrower.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left: Borrower Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {borrower.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold text-gray-900">{borrower.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTrustTypeColor(borrower.trustType)}`}>
                            {borrower.trustType === 'Social' ? 'Known User' : 'AI Verified'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span>Loan: ${borrower.loanAmount.toLocaleString()}</span>
                          {borrower.interestRate > 0 && (
                            <span>Rate: {borrower.interestRate}%</span>
                          )}
                          {borrower.creditScore && (
                            <span>Score: {borrower.creditScore}/100</span>
                          )}
                        </div>
                        {borrower.circleName && (
                          <div className="text-xs text-gray-500 mt-1">
                            Circle: {borrower.circleName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Status & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2 justify-end">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(borrower.riskLevel)}`}>
                            {borrower.riskLevel} Risk
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(borrower.status)}`}>
                            {borrower.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-xs text-gray-500">AI Recommendation:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRecommendationColor(borrower.aiRecommendation)}`}>
                            {borrower.aiRecommendation}
                          </span>
                        </div>
                      </div>
                      <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 whitespace-nowrap">
                        View Details
                      </button>
                    </div>
                  </div>

                  {/* Tooltip Explanation */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>
                        <strong>Trust Source:</strong>{' '}
                        {borrower.trustType === 'Social' 
                          ? 'This borrower is part of your friend circle. Trust is based on social relationships and repayment history within the circle.'
                          : 'This borrower was assessed using AI credit analysis. Risk and interest rates are determined by comprehensive financial profile evaluation.'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );

  return <Layout>{content}</Layout>;
}

