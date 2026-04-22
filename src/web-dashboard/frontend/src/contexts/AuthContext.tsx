import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User } from '../services/authService';
import toast from 'react-hot-toast';

// Permission definitions
export const PERMISSIONS = {
  admin: [
    'dashboard:full',
    'sos:read', 'sos:write', 'sos:delete', 'sos:manage',
    'resources:read', 'resources:write', 'resources:delete', 'resources:manage',
    'analytics:full', 'analytics:export',
    'disasters:read', 'disasters:write', 'disasters:delete', 'disasters:manage',
    'users:read', 'users:write', 'users:manage',
    'reports:read', 'reports:write', 'reports:manage'
  ],
  responder: [
    'dashboard:basic',
    'analytics:basic',
    'reports:read', 'reports:create'
  ]
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (individualId: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  userPermissions: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default admin user for bypassed authentication
  const defaultUser: User = {
    individualId: 'admin_user',
    name: 'System Admin',
    role: 'admin',
    email: 'admin@resq.gov',
    phone: '+94110000000'
  };

  const [user, setUser] = useState<User | null>(defaultUser);
  const [token, setToken] = useState<string | null>('bypass_token');
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfile = async () => {
    // No-op for bypassed auth
    return;
  };

  useEffect(() => {
    // Initialize with default admin user
    setIsLoading(false);
  }, []);

  const login = async (_individualId: string, _otp: string): Promise<boolean> => {
    // Bypass authentication - always return success
    setIsLoading(true);
    
    // Simulate login success with default admin user
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Access granted!');
    }, 500);
    
    return true;
  };

  const logout = async () => {
    // Bypass logout - just clear state
    setIsLoading(false);
    setUser(defaultUser);
    setToken('bypass_token');
    toast.success('Session refreshed');
  };

  const isAuthenticated = !!user && !!token;

  // Get permissions for current user
  const userPermissions = user ? PERMISSIONS[user.role as keyof typeof PERMISSIONS] || [] : [];

  // Check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    return userPermissions.includes(permission);
  };

  // Check if user has a specific role
  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
    refreshProfile,
    hasPermission,
    hasRole,
    userPermissions
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
