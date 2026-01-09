import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { borrowerService } from '../services/borrowerService';
import { loanService } from '../services/loanService';
import { notificationService } from '../services/notificationService';

export default function ExploreBorrowersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [borrowers, setBorrowers] = useState([]);
  const [filters, setFilters] = useState({
    riskLevel: 'All',
    minInterest: '',
    maxInterest: '',
    minAmount: '',
    maxAmount: '',
    duration: 'All',
    search: '',
    sortBy: 'aiRecommendation',
  });

  useEffect(() => {
    const available = borrowerService.getAvailableBorrowers(filters);
    setBorrowers(available);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleInvest = (borrower) => {
    // Create loan investment
    const loan = loanService.createLoan({
      borrowerId: borrower.borrowerId,
      borrowerName: borrower.borrowerName,
      lenderId: user.id,
      lenderName: user.name,
      trustType: 'AI',
      amount: borrower.loanAmount,
      interestRate: borrower.interestRate,
      riskLevel: borrower.riskLevel,
      duration: borrower.duration,
      source: 'AI Marketplace',
      purpose: borrower.purpose,
      creditScore: borrower.creditScore,
      defaultProbability: borrower.defaultProbability,
      aiRecommendation: borrower.aiRecommendation,
      fraudScreeningStatus: borrower.fraudScreeningStatus,
      incomeConsistency: borrower.incomeConsistency,
      riskMonitoring: borrower.riskMonitoring,
    });

    // Remove borrower from available list
    borrowerService.removeBorrower(borrower.borrowerId);

    notificationService.add({
      title: 'Investment Created',
      message: `You've invested $${borrower.loanAmount.toLocaleString()} in ${borrower.borrowerName}'s loan`,
      type: 'success',
    });

    navigate('/marketplace/investments');
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'Approve': return 'bg-green-100 text-green-800';
      case 'Conditional': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Borrowers</h1>
          <p className="text-gray-600">Discover investment opportunities with AI-powered risk assessment</p>
        </div>
        <button
          onClick={() => navigate('/marketplace/investments')}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
        >
          My Investments
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Name or purpose"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level</label>
            <select
              value={filters.riskLevel}
              onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="All">All Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="aiRecommendation">AI Recommendation</option>
              <option value="lowestRisk">Lowest Risk</option>
              <option value="highestReturn">Highest Return</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={filters.minInterest}
                onChange={(e) => handleFilterChange('minInterest', e.target.value)}
                placeholder="Min %"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="number"
                value={filters.maxInterest}
                onChange={(e) => handleFilterChange('maxInterest', e.target.value)}
                placeholder="Max %"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Borrowers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {borrowers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <p>No borrowers match your filters</p>
          </div>
        ) : (
          borrowers.map((borrower) => (
            <div
              key={borrower.borrowerId}
              className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 hover:border-purple-300 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{borrower.borrowerName}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRecommendationColor(borrower.aiRecommendation)}`}>
                  {borrower.aiRecommendation}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Loan Amount</span>
                  <span className="font-semibold">${borrower.loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="font-semibold text-purple-600">{borrower.interestRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Duration</span>
                  <span className="font-semibold">{borrower.duration} months</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Credit Score</span>
                  <span className={`font-semibold ${getScoreColor(borrower.creditScore)}`}>
                    {borrower.creditScore}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Default Probability</span>
                  <span className="font-semibold">{borrower.defaultProbability}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(borrower.riskLevel)}`}>
                    {borrower.riskLevel}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Purpose:</span>
                  <span className="ml-2 font-medium">{borrower.purpose}</span>
                </div>
              </div>

              {/* AI Explanation */}
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-700">{borrower.aiExplanation}</p>
              </div>

              {/* Security Indicators */}
              <div className="flex items-center gap-2 mb-4 text-xs">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  ✓ {borrower.fraudScreeningStatus}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                  ✓ {borrower.incomeConsistency}
                </span>
                <span className={`px-2 py-1 rounded ${
                  borrower.riskMonitoring === 'Stable' ? 'bg-green-100 text-green-800' :
                  borrower.riskMonitoring === 'Watch' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {borrower.riskMonitoring}
                </span>
              </div>

              <button
                onClick={() => handleInvest(borrower)}
                className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 font-semibold"
              >
                Invest ${borrower.loanAmount.toLocaleString()}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute requiredAccess="dashboard">
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}

