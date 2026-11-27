import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Mail, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../contexts/StoreContext';
import {
  AuthAlert,
  AuthCardLayout,
  GoogleSignInButton,
  PasswordField,
} from '../../components/AuthFormElements';

function validatePasswordStrength(password: string): string | null {
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password should include at least one letter and one number.';
  }
  return null;
}

export const Register: React.FC = () => {
  const { register, loginWithGoogle, isFirebaseConfigured } = useAuth();
  const { settings, showToast } = useStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return;
    }

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    const pwError = validatePasswordStrength(password);
    if (pwError) {
      setError(pwError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter carefully.');
      return;
    }

    setSubmitting(true);
    const res = await register(fullName.trim(), trimmedEmail, password);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Could not create account.');
      return;
    }

    showToast(
      'Account created!',
      'We sent a verification email. Please verify your email to continue.'
    );
    navigate('/verify-email', { replace: true });
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSubmitting(true);
    const res = await loginWithGoogle(true);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Google sign-up failed.');
      return;
    }

    showToast('Welcome to Anime Store!', 'Signed in with Google.');
    navigate(res.role === 'admin' ? '/admin' : '/profile', { replace: true });
  };

  return (
    <AuthCardLayout
      title="Join Our Anime Club"
      subtitle={`Create a free account and enjoy ${settings.clubDiscountPercent || 10}% off every order.`}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#D96532] hover:underline">
            Sign In
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
          <label htmlFor="register-name" className="block text-xs font-semibold text-[#5A3224] mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Sokha Meas"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm text-[#3D160F] focus:outline-none focus:border-[#D96532] focus:ring-2 focus:ring-[#D96532]/15"
            />
          </div>
        </div>

        <div>
          <label htmlFor="register-email" className="block text-xs font-semibold text-[#5A3224] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="register-email"
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
          id="register-password"
          label="Password (min. 6 characters, letters & numbers)"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={6}
        />

        <PasswordField
          id="register-confirm-password"
          label="Confirm Password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={6}
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Free Account</span>
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

      <GoogleSignInButton
        onClick={handleGoogleSignUp}
        disabled={submitting}
        label="Sign up with Google"
      />
    </AuthCardLayout>
  );
};

export default Register;
