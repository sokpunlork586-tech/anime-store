import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  reload,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleAuthProvider, isFirebaseConfigured } from '../config/firebase';

export type UserRole = 'customer' | 'admin';

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters with letters and numbers.',
  'auth/invalid-credential': 'Incorrect email or password. Please check your credentials and try again.',
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
  'auth/popup-closed-by-user': 'Google sign-in popup was closed before finishing.',
  'auth/popup-blocked': 'Browser blocked the sign-in popup. Please allow popups for this site.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase Authentication.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
};

/**
 * Maps Firebase Auth error codes to friendly, actionable user messages.
 */
export function getFirebaseErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code?: unknown }).code || '');
    if (FIREBASE_ERROR_MESSAGES[code]) {
      return FIREBASE_ERROR_MESSAGES[code];
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Authentication failed. Please try again.';
}

function assertFirebaseReady() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(
      'Firebase Authentication is not configured. Add VITE_FIREBASE_* values in your root .env file.'
    );
  }
  return auth;
}

export const authService = {
  async registerWithEmail(fullName: string, email: string, password: string): Promise<User> {
    const firebaseAuth = assertFirebaseReady();
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    const cred = await createUserWithEmailAndPassword(firebaseAuth, trimmedEmail, password);
    if (trimmedName) {
      await updateProfile(cred.user, { displayName: trimmedName });
    }
    await sendEmailVerification(cred.user);
    return cred.user;
  },

  async loginWithEmail(email: string, password: string, rememberMe = true): Promise<User> {
    const firebaseAuth = assertFirebaseReady();
    await setPersistence(
      firebaseAuth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const cred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    return cred.user;
  },

  async loginWithGoogle(rememberMe = true): Promise<User> {
    const firebaseAuth = assertFirebaseReady();
    if (!googleAuthProvider) {
      throw new Error('Google Sign-In provider is not initialized.');
    }
    await setPersistence(
      firebaseAuth,
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
    const cred = await signInWithPopup(firebaseAuth, googleAuthProvider);
    return cred.user;
  },

  async logout(): Promise<void> {
    if (!auth) return;
    await signOut(auth);
  },

  async resetPassword(email: string): Promise<void> {
    const firebaseAuth = assertFirebaseReady();
    await sendPasswordResetEmail(firebaseAuth, email.trim());
  },

  async sendVerificationEmail(user?: User | null): Promise<void> {
    const firebaseAuth = assertFirebaseReady();
    const target = user || firebaseAuth.currentUser;
    if (!target) {
      throw new Error('No signed-in user found to verify.');
    }
    await sendEmailVerification(target);
  },

  async refreshVerificationStatus(user?: User | null): Promise<boolean> {
    const firebaseAuth = assertFirebaseReady();
    const target = user || firebaseAuth.currentUser;
    if (!target) return false;
    await reload(target);
    return Boolean(firebaseAuth.currentUser?.emailVerified);
  },

  /**
   * Resolves the user's role strictly from trusted sources:
   * 1) Signed Firebase ID token custom claims (`role` or `admin`)
   * 2) Backend verified token role lookup (`POST /api/v1/auth/firebase-role`)
   * Never reads roles from localStorage or editable client fields.
   */
  async resolveTrustedRole(user: User): Promise<UserRole> {
    try {
      const tokenResult = await user.getIdTokenResult(true);
      const claimRole = String(tokenResult.claims.role || '').toLowerCase();
      if (tokenResult.claims.admin === true || claimRole === 'admin' || claimRole === 'super_admin') {
        return 'admin';
      }

      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const res = await fetch(`${apiUrl}/auth/firebase-role`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenResult.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.role === 'admin' || data?.role === 'super_admin') {
          return 'admin';
        }
      }
    } catch {
      // Fail closed to standard customer role if trusted verification fails
    }
    return 'customer';
  },
};
