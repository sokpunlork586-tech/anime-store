import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import {
  authService,
  getFirebaseErrorMessage,
  type UserRole,
} from '../services/authService';

export interface AuthResult {
  ok: boolean;
  user?: User;
  role?: UserRole;
  error?: string;
}

export interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmailVerified: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  loginWithGoogle: (rememberMe?: boolean) => Promise<AuthResult>;
  register: (fullName: string, email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  resendVerification: () => Promise<AuthResult>;
  refreshVerificationStatus: () => Promise<boolean>;
}

const globalForAuth = globalThis as unknown as {
  __ANIME_AUTH_CONTEXT__?: React.Context<AuthContextValue | undefined>;
};

export const AuthContext =
  globalForAuth.__ANIME_AUTH_CONTEXT__ ??
  (globalForAuth.__ANIME_AUTH_CONTEXT__ = createContext<AuthContextValue | undefined>(undefined));

function computeIsVerified(firebaseUser: User | null): boolean {
  if (!firebaseUser) return false;
  if (firebaseUser.emailVerified) return true;
  // Social providers such as Google verify ownership at sign-in
  return firebaseUser.providerData.some((p) => p.providerId !== 'password');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState<boolean>(isFirebaseConfigured);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setIsEmailVerified(false);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);
      setIsEmailVerified(computeIsVerified(firebaseUser));
      const trustedRole = await authService.resolveTrustedRole(firebaseUser);
      if (!cancelled) {
        setRole(trustedRole);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe = true): Promise<AuthResult> => {
      try {
        const loggedInUser = await authService.loginWithEmail(email, password, rememberMe);
        const trustedRole = await authService.resolveTrustedRole(loggedInUser);
        setUser(loggedInUser);
        setRole(trustedRole);
        setIsEmailVerified(computeIsVerified(loggedInUser));
        return { ok: true, user: loggedInUser, role: trustedRole };
      } catch (err) {
        return { ok: false, error: getFirebaseErrorMessage(err) };
      }
    },
    []
  );

  const loginWithGoogle = useCallback(async (rememberMe = true): Promise<AuthResult> => {
    try {
      const loggedInUser = await authService.loginWithGoogle(rememberMe);
      const trustedRole = await authService.resolveTrustedRole(loggedInUser);
      setUser(loggedInUser);
      setRole(trustedRole);
      setIsEmailVerified(computeIsVerified(loggedInUser));
      return { ok: true, user: loggedInUser, role: trustedRole };
    } catch (err) {
      return { ok: false, error: getFirebaseErrorMessage(err) };
    }
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string): Promise<AuthResult> => {
      try {
        const createdUser = await authService.registerWithEmail(fullName, email, password);
        setUser(createdUser);
        setRole('customer');
        setIsEmailVerified(computeIsVerified(createdUser));
        return { ok: true, user: createdUser, role: 'customer' };
      } catch (err) {
        return { ok: false, error: getFirebaseErrorMessage(err) };
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setRole(null);
    setIsEmailVerified(false);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    try {
      await authService.resetPassword(email);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getFirebaseErrorMessage(err) };
    }
  }, []);

  const resendVerification = useCallback(async (): Promise<AuthResult> => {
    try {
      await authService.sendVerificationEmail(user);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: getFirebaseErrorMessage(err) };
    }
  }, [user]);

  const refreshVerificationStatus = useCallback(async (): Promise<boolean> => {
    const verified = await authService.refreshVerificationStatus(user);
    if (auth?.currentUser) {
      setUser(auth.currentUser);
      setIsEmailVerified(computeIsVerified(auth.currentUser));
      if (verified) {
        const trustedRole = await authService.resolveTrustedRole(auth.currentUser);
        setRole(trustedRole);
      }
    }
    return verified;
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: role === 'admin',
      isEmailVerified,
      isFirebaseConfigured,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      resendVerification,
      refreshVerificationStatus,
    }),
    [
      user,
      role,
      loading,
      isEmailVerified,
      login,
      loginWithGoogle,
      register,
      logout,
      resetPassword,
      resendVerification,
      refreshVerificationStatus,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
