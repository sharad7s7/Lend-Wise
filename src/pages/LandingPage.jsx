import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/common/Layout';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, canAccessFriendCircle, canAccessMarketplace, canAccessDashboard } = useAuth();

  const content = (
    <div className="container mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          LendWise
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          AI-Powered Peer-to-Peer Lending
        </p>
        <p className="text-lg text-gray-500">
          Trust-based lending for friends. AI-based lending for everyone.
        </p>
      </div>

      {/* Two Modes Explanation */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className={`grid gap-8 ${isAuthenticated && !canAccessFriendCircle ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}>
          {/* Friend Circle Mode - Only show for students or unauthenticated */}
          {(isAuthenticated ? canAccessFriendCircle : true) && (
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-primary-200 hover:border-primary-400 transition-all">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Friend Circle</h2>
            </div>
            <p className="text-gray-600 mb-6">
              For people you know. Lend and borrow within your trusted friend circles with no contracts, no interest by default, and social trust monitoring.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                One-tap lending among friends
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No contracts or interest
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-primary-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Social trust monitoring
              </li>
            </ul>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else if (canAccessFriendCircle) {
                  navigate('/friend-circle');
                } else {
                  alert('Friend Circle is only available for students. Please sign up as a student to access this feature.');
                }
              }}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              {!isAuthenticated ? 'Sign In to Access' : 'Friend Circle Lending'}
            </button>
          </div>
          )}
          
          {/* Non-student message */}
          {isAuthenticated && !canAccessFriendCircle && (
            <div className="bg-gray-50 rounded-xl shadow-lg p-8 border-2 border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Social Lending</h2>
              </div>
              <p className="text-gray-600 mb-4">
                You are not eligible for social lending. Friend Circle lending is exclusively available to verified students.
              </p>
              <p className="text-sm text-gray-500">
                Use AI Marketplace instead to access fair lending opportunities through AI-powered credit assessment.
              </p>
            </div>
          )}

          {/* AI Marketplace Mode */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200 hover:border-purple-400 transition-all">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">AI Marketplace</h2>
            </div>
            <p className="text-gray-600 mb-6">
              For people you don't know. Access fair lending opportunities through AI-powered credit assessment that ensures trust, fairness, and safety for all parties.
            </p>
            <ul className="space-y-2 mb-6 text-sm text-gray-600">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                AI credit assessment
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Transparent risk pricing
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Explainable AI decisions
              </li>
            </ul>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  navigate('/marketplace');
                }
              }}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              {!isAuthenticated ? 'Sign In to Access' : 'AI Marketplace Lending'}
            </button>
          </div>
        </div>
      </div>

      {/* Additional CTAs */}
      <div className="text-center space-y-4">
        {isAuthenticated && canAccessDashboard && (
          <button
            onClick={() => navigate('/dashboard')}
            className="text-primary-600 hover:text-primary-700 font-semibold block mx-auto"
          >
            View Lender Dashboard →
          </button>
        )}
        {!isAuthenticated && (
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return isAuthenticated ? <Layout>{content}</Layout> : content;
}

