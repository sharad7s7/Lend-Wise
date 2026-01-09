import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';

export default function ProtectedRoute({ children, requiredRole, requiredAccess }) {
  const { isAuthenticated, user, canAccessFriendCircle, canAccessMarketplace, canAccessDashboard, canAccessAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    notificationService.add({
      title: 'Access Denied',
      message: `This page is only available to ${requiredRole}s.`,
      type: 'error',
    });
    return <Navigate to="/" replace />;
  }

  if (requiredAccess === 'friend-circle' && !canAccessFriendCircle) {
    notificationService.add({
      title: 'Access Restricted',
      message: 'Friend Circle lending is only available to verified students.',
      type: 'error',
    });
    return <Navigate to="/" replace />;
  }

  if (requiredAccess === 'marketplace' && !canAccessMarketplace) {
    notificationService.add({
      title: 'Access Denied',
      message: 'You do not have access to the marketplace.',
      type: 'error',
    });
    return <Navigate to="/" replace />;
  }

  if (requiredAccess === 'dashboard' && !canAccessDashboard) {
    notificationService.add({
      title: 'Access Denied',
      message: 'Lender Dashboard is only available to lenders.',
      type: 'error',
    });
    return <Navigate to="/" replace />;
  }

  if (requiredAccess === 'admin' && !canAccessAdmin) {
    notificationService.add({
      title: 'Access Denied',
      message: 'Admin panel is only available to administrators.',
      type: 'error',
    });
    return <Navigate to="/" replace />;
  }

  return children;
}

