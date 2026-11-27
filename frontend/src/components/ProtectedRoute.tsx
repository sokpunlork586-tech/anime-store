import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  requireVerified?: boolean;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireGuest = false,
  requireVerified = true,
  allowedRoles,
}) => {
  const { isAuthenticated, isEmailVerified, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[55vh] flex flex-col items-center justify-center gap-3 text-[#5A3224]">
        <Loader2 className="w-8 h-8 animate-spin text-[#D96532]" />
        <p className="text-sm font-medium">Verifying your Anime Store session...</p>
      </div>
    );
  }

  // Prevent authenticated users from visiting guest-only pages (Login, Register, ForgotPassword)
  if (requireGuest) {
    if (isAuthenticated) {
      if (!isEmailVerified) {
        return <Navigate to="/verify-email" replace />;
      }
      const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      const target = fromPath || (role === 'admin' ? '/admin' : '/profile');
      return <Navigate to={target} replace />;
    }
    return <>{children}</>;
  }

  // Redirect unauthenticated users to Login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Restrict protected pages until email is verified
  if (requireAuth && requireVerified && isAuthenticated && !isEmailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // Role-based access check (validated from trusted Firebase claims / backend lookup)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-[#FFF8EF]">
          <div className="max-w-md w-full rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-8 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#C62828]/10 text-[#C62828] flex items-center justify-center mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl font-extrabold text-[#3D160F]">
              Administrator Access Required
            </h1>
            <p className="mt-2 text-sm text-[#724A3E]">
              Your account does not have verified administrator privileges to open this area.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold transition-colors"
              >
                Back to Storefront
              </Link>
              <Link
                to="/profile"
                className="px-5 py-2.5 rounded-full border border-[#DFC5AA] text-[#3D160F] text-sm font-semibold hover:bg-[#F7DCC3]/40 transition-colors"
              >
                My Profile
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
