import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import { borrowRequestService } from '../services/borrowRequestService';
import { assessCredit } from '../utils/aiEngine';
import { notificationService } from '../services/notificationService';

export default function BorrowPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    loanAmount: '',
    purpose: 'General',
    duration: 12,
    monthlyIncome: '',
    repaymentPreference: 'Monthly',
  });
  const [myRequests, setMyRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const requests = borrowRequestService.getUserRequests(user.id);
      setMyRequests(requests);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get AI assessment for the request
      let assessment = null;
      if (formData.monthlyIncome) {
        assessment = assessCredit({
          monthlyIncome: Number(formData.monthlyIncome),
          employmentType: user?.role === 'Student' ? 'Student' : 'Salaried',
          loanAmount: Number(formData.loanAmount),
          duration: Number(formData.duration),
          repaymentBehavior: 'Average',
        });
      }

      const request = borrowRequestService.createRequest({
        borrowerId: user.id,
        borrowerName: user.name,
        amount: Number(formData.loanAmount),
        purpose: formData.purpose,
        duration: Number(formData.duration),
        monthlyIncome: formData.monthlyIncome ? Number(formData.monthlyIncome) : null,
        repaymentPreference: formData.repaymentPreference,
        creditScore: assessment?.creditScore || null,
        riskLevel: assessment?.riskCategory || null,
        suggestedInterestRate: assessment?.interestRate || null,
        defaultProbability: assessment?.defaultProbability || null,
      });

      setMyRequests([...myRequests, request]);
      setFormData({
        loanAmount: '',
        purpose: 'General',
        duration: 12,
        monthlyIncome: '',
        repaymentPreference: 'Monthly',
      });

      notificationService.add({
        title: 'Borrow Request Created',
        message: `Your request for $${formData.loanAmount.toLocaleString()} has been posted`,
        type: 'success',
      });
    } catch (error) {
      notificationService.add({
        title: 'Error',
        message: 'Failed to create borrow request',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'Funded': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const content = (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Borrow</h1>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Borrow Request Form */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">Request a Loan</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Amount ($)
              </label>
              <input
                type="number"
                value={formData.loanAmount}
                onChange={(e) => setFormData({ ...formData, loanAmount: e.target.value })}
                required
                min="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Enter amount"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Loan Purpose
              </label>
              <select
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="General">General</option>
                <option value="Education">Education</option>
                <option value="Medical">Medical</option>
                <option value="Home Improvement">Home Improvement</option>
                <option value="Business">Business</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (months)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                required
                min="1"
                max="60"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Monthly Income ($) - Optional
              </label>
              <input
                type="number"
                value={formData.monthlyIncome}
                onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Helps determine interest rate"
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing income helps lenders assess your request and may result in better rates
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Repayment Preference
              </label>
              <select
                value={formData.repaymentPreference}
                onChange={(e) => setFormData({ ...formData, repaymentPreference: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="Monthly">Monthly</option>
                <option value="Bi-weekly">Bi-weekly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Request...' : 'Create Borrow Request'}
            </button>
          </form>
        </div>

        {/* My Borrow Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-6">My Borrow Requests</h2>
          
          {myRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No borrow requests yet</p>
              <p className="text-sm mt-2">Create a request to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((request) => (
                <div
                  key={request.requestId}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      ${request.amount.toLocaleString()}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Purpose: {request.purpose}</div>
                    <div>Duration: {request.duration} months</div>
                    {request.interestRate && (
                      <div>Interest Rate: {request.interestRate}%</div>
                    )}
                    {request.lenderName && (
                      <div>Lender: {request.lenderName}</div>
                    )}
                    <div className="text-xs text-gray-500 mt-2">
                      Created: {request.createdAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Lenders cannot create borrow requests
  if (user?.role === 'Lender') {
    return (
      <ProtectedRoute>
        <Layout>
          <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <p className="text-gray-600 mb-4">Lenders cannot create borrow requests.</p>
              <a href="/lend" className="text-purple-600 hover:text-purple-700 font-semibold">
                Go to Lend Page →
              </a>
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Layout>{content}</Layout>
    </ProtectedRoute>
  );
}

