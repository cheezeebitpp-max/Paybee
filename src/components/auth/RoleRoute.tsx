import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: Array<'USER' | 'ADMIN' | 'SUPER_ADMIN'>;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    // If user is a standard USER, redirect to user dashboard
    // If not logged in, ProtectedRoute handles it (but we check user here too)
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RoleRoute;
