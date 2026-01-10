import { useApp } from '../context/AppContext';

export function useAuth() {
  const { user, isAuthenticated, login, logout, updateUser } = useApp();

  // Handle both legacy mock roles (Capitalized) and new backend roles (lowercase)
  const isStudent = user?.role === 'Student' || user?.role === 'borrower'; 
  const isLender = user?.role === 'Lender' || user?.role === 'lender';
  const isNonStudent = user?.role === 'Non-student'; 
  const isAdmin = user?.role === 'Admin' || user?.role === 'admin';

  const canAccessFriendCircle = isStudent; // Borrowers can access friend circle
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
