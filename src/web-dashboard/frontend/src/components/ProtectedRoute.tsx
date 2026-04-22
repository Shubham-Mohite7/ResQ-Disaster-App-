import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'citizen' | 'responder' | 'admin';
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission
}) => {
  // Authentication bypassed - direct access to admin panel
  return <>{children}</>;
};

export default ProtectedRoute;
