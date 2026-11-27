import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../contexts/StoreContext';
import {
  AuthAlert,
  AuthCardLayout,
  GoogleSignInButton,
  PasswordField,
} from '../../components/AuthFormElements';

export const Login: React.FC = () => {
  const { login, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const { showToast } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const navigateAfterLogin = (role?: string, emailVerified?: boolean) => {
    if (emailVerified === false) {
      navigate('/verify-email', { replace: true });
      return;
    }
    if (fromPath) {
      navigate(fromPath, { replace: true });
      return;
    }
    navigate(role === 'admin' ? '/admin' : '/profile', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    const res = await login(trimmedEmail, password, rememberMe);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Unable to sign in.');
      return;
    }

    showToast('Welcome back!', `Signed in as ${res.user?.displayName || res.user?.email}`);
    navigateAfterLogin(res.role, res.user?.emailVerified);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSubmitting(true);
    const res = await loginWithGoogle(rememberMe);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Google sign-in failed.');
      return;
    }

    showToast('Welcome back!', `Signed in with Google as ${res.user?.displayName || res.user?.email}`);
    navigateAfterLogin(res.role, true);
  };

  return (
    <AuthCardLayout
      title="Welcome Back"
      subtitle="Sign in to access your wishlist, orders, and Anime Club savings."
      footer={
        <>
          New to Anime Store?{' '}
          <Link to="/register" className="font-semibold text-[#D96532] hover:underline">
            Create an Account
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured && (
        <AuthAlert
          type="warning"
          message="Firebase environment variables (VITE_FIREBASE_*) are not configured in .env yet."
        />
      )}

      {error && <AuthAlert type="error" message={error} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="login-email" className="block text-xs font-semibold text-[#5A3224] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm text-[#3D160F] focus:outline-none focus:border-[#D96532] focus:ring-2 focus:ring-[#D96532]/15"
            />
          </div>
        </div>

        <PasswordField
          id="login-password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between text-xs">
          <label className="inline-flex items-center gap-2 text-[#5A3224] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-[#D96532] cursor-pointer"
            />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password" className="font-semibold text-[#D96532] hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] font-semibold text-[#9D7A68] uppercase tracking-wider">
        <span className="h-px flex-1 bg-[#EFE0CE]" />
        <span>or</span>
        <span className="h-px flex-1 bg-[#EFE0CE]" />
      </div>

      <GoogleSignInButton onClick={handleGoogleLogin} disabled={submitting} />
    </AuthCardLayout>
  );
};

export default Login;
