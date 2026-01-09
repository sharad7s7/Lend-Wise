import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { assessCredit } from '../utils/aiEngine';
import Layout from './common/Layout';
import { useAuth } from '../hooks/useAuth';

export default function OpenMarketplace() {
  const navigate = useNavigate();
  const { user, isLender } = useAuth();
  const [formData, setFormData] = useState({
    monthlyIncome: '',
    employmentType: 'Student',
    loanAmount: '',
    duration: 12,
    repaymentBehavior: 'Average',
  });
  const [assessment, setAssessment] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'monthlyIncome' || name === 'loanAmount' || name === 'duration' 
        ? value === '' ? '' : Number(value)
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setShowResults(false);

    // Simulate AI analysis delay
    setTimeout(() => {
      const result = assessCredit({
        monthlyIncome: Number(formData.monthlyIncome),
        employmentType: formData.employmentType,
        loanAmount: Number(formData.loanAmount),
        duration: Number(formData.duration),
        repaymentBehavior: formData.repaymentBehavior,
      });
      setAssessment(result);
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2000);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'Conditional': return 'bg-yellow-100 text-yellow-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-gray-900">AI Marketplace</h1>
            <p className="text-gray-600 mt-2">
              {isLender 
                ? 'Browse investment opportunities with AI-powered risk assessment'
                : 'Get assessed by AI for fair lending opportunities'}
            </p>
          </div>
          {isLender && (
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Dashboard
            </button>
          )}
        </div>

        {isLender ? (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Investment Opportunities</h2>
            <p className="text-gray-600 mb-6">
              As a lender, you can browse and invest in loans through AI-powered credit analysis. 
              All investments are tracked and monitored for your security.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/marketplace/explore')}
                className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Explore Borrowers
              </button>
              <button
                onClick={() => navigate('/marketplace/investments')}
                className="w-full bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
              >
                My Investments
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Credit Assessment Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-6">Credit Assessment Form</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Monthly Income ($)
                </label>
                <input
                  type="number"
                  name="monthlyIncome"
                  value={formData.monthlyIncome}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter your monthly income"
                />
              </div>

              {/* Employment Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Employment Type
                </label>
                <select
                  name="employmentType"
                  value={formData.employmentType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Student">Student</option>
                  <option value="Salaried">Salaried</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Amount ($)
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  required
                  min="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter desired loan amount"
                />
              </div>

              {/* Loan Duration */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Loan Duration (months)
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="60"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Repayment Behavior */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Past Repayment Behavior
                </label>
                <select
                  name="repaymentBehavior"
                  value={formData.repaymentBehavior}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isAnalyzing}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI Analyzing...
                  </span>
                ) : (
                  'Get AI Assessment'
                )}
              </button>
            </form>
          </div>

          {/* AI Assessment Results */}
          <div className="space-y-6">
            {isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 font-semibold">AI is analyzing your credit profile...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            )}

            {showResults && assessment && (
              <>
                {/* Key Metrics */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-semibold mb-6">AI Assessment Results</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* Credit Score */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-600 mb-1">Credit Score</div>
                      <div className={`text-3xl font-bold ${getScoreColor(assessment.creditScore)}`}>
                        {assessment.creditScore}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">out of 100</div>
                    </div>

                    {/* Risk Category */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-600 mb-1">Risk Category</div>
                      <div className={`text-lg font-bold px-3 py-1 rounded-full inline-block border-2 ${getRiskColor(assessment.riskCategory)}`}>
                        {assessment.riskCategory}
                      </div>
                    </div>

                    {/* Default Probability */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-600 mb-1">Default Probability</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {assessment.defaultProbability}%
                      </div>
                    </div>

                    {/* Interest Rate */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm font-semibold text-gray-600 mb-1">Interest Rate</div>
                      <div className="text-3xl font-bold text-purple-600">
                        {assessment.interestRate}%
                      </div>
                    </div>
                  </div>

                  {/* Approval Status */}
                  <div className={`rounded-lg p-4 border-2 ${getStatusColor(assessment.approvalStatus)}`}>
                    <div className="text-sm font-semibold mb-1">Approval Status</div>
                    <div className="text-2xl font-bold">
                      {assessment.approvalStatus}
                    </div>
                  </div>
                </div>

                {/* Explainable AI Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Explainable AI Analysis
                  </h2>
                  <div className="space-y-4">
                    {assessment.explanations.map((explanation, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{explanation.title}</h3>
                        <p className="text-gray-700 text-sm leading-relaxed">{explanation.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {!showResults && !isAnalyzing && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Fill out the form to get your AI credit assessment</p>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
  );

  return <Layout>{content}</Layout>;
}

