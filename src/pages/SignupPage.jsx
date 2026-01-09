import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useApp } from '../context/AppContext';
import { notificationService } from '../services/notificationService';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Student',
    isStudentVerified: false,
    securityDeposit: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate security deposit
      if (!formData.securityDeposit || Number(formData.securityDeposit) < 500) {
        setError('Security deposit must be at least $500');
        setIsLoading(false);
        return;
      }

      const user = await authService.signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.isStudentVerified,
        Number(formData.securityDeposit)
      );
      login(user);
      notificationService.add({
        title: 'Welcome to LendWise!',
        message: `Account created successfully. ${formData.role === 'Student' ? 'You can now access Friend Circle lending.' : 'You can access AI Marketplace lending.'}`,
        type: 'success',
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LendWise</h1>
          <p className="text-gray-600">Create your account</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              {formData.role === 'Student' && (
                <p className="text-xs text-gray-500 mt-1">
                  Use your .edu email address for student verification
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                I am a
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, isStudentVerified: false })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Student">Student</option>
                <option value="Non-student">Non-student</option>
                <option value="Lender">Lender</option>
              </select>
            </div>

            {formData.role === 'Student' && (
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="studentVerified"
                  checked={formData.isStudentVerified}
                  onChange={(e) => setFormData({ ...formData, isStudentVerified: e.target.checked })}
                  className="mt-1 mr-2"
                />
                <label htmlFor="studentVerified" className="text-sm text-gray-700">
                  I verify that I am a student and using a valid .edu email address
                </label>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Security Deposit ($)
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                  className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {showSecurityInfo ? 'Hide Info' : 'What is this?'}
                </button>
              </div>
              {showSecurityInfo && (
                <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  <p className="font-semibold mb-2">🔒 Security Deposit Protection</p>
                  <p>A security deposit ensures trust in our lending community. If you fail to repay a loan within the deadline, the system can deduct from your security deposit to protect lenders.</p>
                </div>
              )}
              <input
                type="number"
                value={formData.securityDeposit}
                onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                required
                min="500"
                step="100"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Minimum $500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum deposit: $500 | This protects both you and lenders
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

