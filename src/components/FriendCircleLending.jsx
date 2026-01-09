import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockCircles } from '../utils/mockData';

export default function FriendCircleLending() {
  const navigate = useNavigate();
  const [circles] = useState(mockCircles);
  const [selectedCircle, setSelectedCircle] = useState(circles[0]);

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Good': return 'bg-green-100 text-green-800';
      case 'Average': return 'bg-yellow-100 text-yellow-800';
      case 'Risky': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 mb-4 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            <h1 className="text-4xl font-bold text-gray-900">Friend Circle Lending</h1>
            <p className="text-gray-600 mt-2">Lend and borrow with people you trust</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Dashboard
          </button>
        </div>

        {/* Circle Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Circles</h2>
          <div className="flex gap-4">
            {circles.map((circle) => (
              <button
                key={circle.id}
                onClick={() => setSelectedCircle(circle)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedCircle.id === circle.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-primary-50'
                }`}
              >
                {circle.name}
              </button>
            ))}
            <button className="px-6 py-3 rounded-lg font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300">
              + Create Circle
            </button>
          </div>
        </div>

        {/* Circle Details */}
        {selectedCircle && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Circle Trust Score */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Circle Trust Score</h3>
              <div className={`text-4xl font-bold mb-2 ${getTrustScoreColor(selectedCircle.circleTrustScore)}`}>
                {selectedCircle.circleTrustScore}
              </div>
              <p className="text-sm text-gray-600">
                Based on repayment behavior of all members
              </p>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Total Loans</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {selectedCircle.totalLoans}
              </div>
              <p className="text-sm text-gray-600">
                {selectedCircle.activeLoans} currently active
              </p>
            </div>

            {/* Quick Action */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700">
                  Lend Money
                </button>
                <button className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300">
                  Request Loan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {selectedCircle && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Circle Members</h2>
            <div className="space-y-4">
              {selectedCircle.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                      <span className="text-primary-600 font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-600">
                        Repayment Rate: {member.repaymentRate}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(member.trustBadge)}`}>
                      {member.trustBadge}
                    </span>
                    <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">
                      Lend
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explainability Panel */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-primary-500">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <svg className="w-6 h-6 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            How Friend Circle Trust Works
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Social Trust Monitoring:</strong> Trust is based on your repayment history within this circle. 
              Each member's trust badge reflects their reliability in past transactions.
            </p>
            <p>
              <strong>No AI Risk Pricing:</strong> Friend Circle lending operates on social trust, not algorithmic risk assessment. 
              Loans are typically interest-free and contract-free, relying on the strength of personal relationships.
            </p>
            <p>
              <strong>Circle Trust Score:</strong> The overall circle score is calculated from the average repayment behavior 
              of all members, helping you understand the collective reliability of your circle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

