import { useApp } from '../context/AppContext';

export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useApp();

  const isStudent = user?.role === 'Student';
  const isLender = user?.role === 'Lender';
  const isNonStudent = user?.role === 'Non-student';
  const isAdmin = user?.role === 'Admin';

  const canAccessFriendCircle = isStudent;
  const canAccessMarketplace = true; // All users can access
  const canAccessDashboard = isLender;
  const canAccessAdmin = isAdmin;

  return {
    user,
    isAuthenticated,
    isStudent,
    isLender,
    isNonStudent,
    isAdmin,
    canAccessFriendCircle,
    canAccessMarketplace,
    canAccessDashboard,
    canAccessAdmin,
    login,
    logout,
    updateUser,
  };
}
