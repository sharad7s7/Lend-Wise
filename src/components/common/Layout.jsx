import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from './NotificationCenter';

export default function Layout({ children, showNotifications = true }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return children;
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Student': return 'bg-primary-100 text-primary-800';
      case 'Lender': return 'bg-purple-100 text-purple-800';
      case 'Non-student': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/')}
                className="text-2xl font-bold text-primary-600 hover:text-primary-700"
              >
                LendWise
              </button>
              <div className="hidden md:flex items-center gap-4">
                {user?.role === 'Student' && (
                  <button
                    onClick={() => navigate('/friend-circle')}
                    className="text-gray-700 hover:text-primary-600 font-medium"
                  >
                    Friend Circle
                  </button>
                )}
                <button
                  onClick={() => navigate('/marketplace')}
                  className="text-gray-700 hover:text-purple-600 font-medium"
                >
                  AI Marketplace
                </button>
                {user?.role === 'Lender' && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-700 hover:text-primary-600 font-medium"
                  >
                    Dashboard
                  </button>
                )}
                {user?.role === 'Admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Admin
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {showNotifications && <NotificationCenter />}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </span>
                </div>
                <span className="hidden md:block font-medium">{user?.name}</span>
              </button>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(user?.role)}`}>
                {user?.role}
              </span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
}

