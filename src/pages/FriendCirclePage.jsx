import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ProtectedRoute from '../components/common/ProtectedRoute';
import Layout from '../components/common/Layout';
import { circleService } from '../services/circleService';
import { notificationService } from '../services/notificationService';

export default function FriendCirclePage() {
  const { user } = useAuth();
  const [circles, setCircles] = useState([]);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLendModal, setShowLendModal] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [newCircleName, setNewCircleName] = useState('');
  const [lendAmount, setLendAmount] = useState('');
  const [lendPurpose, setLendPurpose] = useState('Food');

  useEffect(() => {
    if (user) {
      const userCircles = circleService.getUserCircles(user.id);
      setCircles(userCircles);
      if (userCircles.length > 0 && !selectedCircle) {
        setSelectedCircle(userCircles[0]);
      }
    }
  }, [user]);

  const handleCreateCircle = () => {
    if (!newCircleName.trim()) return;
    
    const newCircle = circleService.createCircle(
      newCircleName,
      user.id,
      user.name,
      user.email
    );
    setCircles([...circles, newCircle]);
    setSelectedCircle(newCircle);
    setShowCreateModal(false);
    setNewCircleName('');
    notificationService.add({
      title: 'Circle Created',
      message: `You've created "${newCircleName}" circle`,
      type: 'success',
    });
  };

  const handleLend = () => {
    if (!selectedBorrower || !lendAmount || !selectedCircle) return;
    
    try {
      const loan = circleService.createLoan(
        selectedCircle.id,
        user.id,
        selectedBorrower.id,
        Number(lendAmount),
        lendPurpose
      );
      setShowLendModal(false);
      setLendAmount('');
      notificationService.add({
        title: 'Loan Created',
        message: `You've lent $${lendAmount} to ${selectedBorrower.name}`,
        type: 'success',
      });
      // Refresh circles
      setCircles(circleService.getUserCircles(user.id));
    } catch (error) {
      alert(error.message);
    }
  };

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

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Friend Circle Lending</h1>
      <p className="text-gray-600 mb-8">Lend and borrow with people you trust</p>

      {/* Circle Selection */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Your Circles</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            + Create Circle
          </button>
        </div>
        <div className="flex gap-4 flex-wrap">
          {circles.map((circle) => (
            <button
              key={circle.id}
              onClick={() => setSelectedCircle(circle)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedCircle?.id === circle.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-200'
              }`}
            >
              {circle.name}
            </button>
          ))}
        </div>
      </div>

      {selectedCircle && (
        <>
          {/* Circle Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Circle Trust Score</h3>
              <div className={`text-4xl font-bold mb-2 ${getTrustScoreColor(selectedCircle.circleTrustScore)}`}>
                {selectedCircle.circleTrustScore}
              </div>
              <p className="text-sm text-gray-600">Based on member behavior</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Total Loans</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">{selectedCircle.totalLoans}</div>
              <p className="text-sm text-gray-600">{selectedCircle.activeLoans} active</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Completed</h3>
              <div className="text-4xl font-bold text-green-600 mb-2">{selectedCircle.completedLoans}</div>
              <p className="text-sm text-gray-600">Successfully repaid</p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">Circle Health</h3>
              <div className={`text-4xl font-bold mb-2 ${
                selectedCircle.circleTrustScore >= 90 ? 'text-green-600' :
                selectedCircle.circleTrustScore >= 75 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {selectedCircle.circleTrustScore >= 90 ? 'Excellent' :
                 selectedCircle.circleTrustScore >= 75 ? 'Good' : 'Needs Attention'}
              </div>
            </div>
          </div>

          {/* Members List */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Circle Members</h2>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-semibold">
                + Invite Member
              </button>
            </div>
            <div className="space-y-4">
              {selectedCircle.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{member.name}</span>
                        {member.isAdmin && (
                          <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">Admin</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Trust: {member.personalTrustScore} | Streak: {member.repaymentStreak} | Rate: {member.repaymentRate}%
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBadgeColor(member.trustBadge)}`}>
                      {member.trustBadge}
                    </span>
                    {member.id !== user.id && (
                      <button
                        onClick={() => {
                          setSelectedBorrower(member);
                          setShowLendModal(true);
                        }}
                        className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                      >
                        Lend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

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
                <strong>Social Trust Monitoring:</strong> Trust is based on repayment history within this circle. 
                Each member's trust badge reflects their reliability in past transactions.
              </p>
              <p>
                <strong>No AI Risk Pricing:</strong> Friend Circle lending operates on social trust, not algorithmic risk assessment. 
                Loans are typically interest-free and contract-free, relying on the strength of personal relationships.
              </p>
              <p>
                <strong>Trust Decay:</strong> Missed payments reduce trust scores and repayment streaks. 
                Consistent repayment builds stronger trust over time.
              </p>
              <p>
                <strong>Loan Caps:</strong> Students have a maximum outstanding loan limit of $1,000 to ensure responsible lending.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Create Circle Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Create New Circle</h3>
            <input
              type="text"
              value={newCircleName}
              onChange={(e) => setNewCircleName(e.target.value)}
              placeholder="Circle name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-4">
              <button
                onClick={handleCreateCircle}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewCircleName('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lend Modal */}
      {showLendModal && selectedBorrower && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Lend to {selectedBorrower.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Purpose</label>
                <select
                  value={lendPurpose}
                  onChange={(e) => setLendPurpose(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="Food">Food</option>
                  <option value="Books">Books</option>
                  <option value="Travel">Travel</option>
                  <option value="Emergency">Emergency</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleLend}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
              >
                Lend
              </button>
              <button
                onClick={() => {
                  setShowLendModal(false);
                  setLendAmount('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const wrappedContent = <Layout>{content}</Layout>;

  return (
    <ProtectedRoute requiredAccess="friend-circle">
      {wrappedContent}
    </ProtectedRoute>
  );
}

