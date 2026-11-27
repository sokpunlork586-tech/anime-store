import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, Send } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../contexts/StoreContext';
import { AuthAlert, AuthCardLayout } from '../../components/AuthFormElements';

export const ForgotPassword: React.FC = () => {
  const { resetPassword, isFirebaseConfigured } = useAuth();
  const { showToast } = useStore();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedEmail = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    const res = await resetPassword(trimmedEmail);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Could not send reset email.');
      return;
    }

    const msg = `Password reset email sent to ${trimmedEmail}. Please check your inbox and spam folder.`;
    setSuccessMsg(msg);
    showToast('Reset Email Sent', `Check ${trimmedEmail} for reset instructions.`);
  };

  return (
    <AuthCardLayout
      title="Reset Your Password"
      subtitle="Enter your registered email and we will send you a Firebase password reset link."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-[#D96532] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>
      }
    >
      {!isFirebaseConfigured && (
        <AuthAlert
          type="warning"
          message="Firebase environment variables (VITE_FIREBASE_*) are not configured in .env yet."
        />
      )}

      {error && <AuthAlert type="error" message={error} />}
      {successMsg && <AuthAlert type="success" message={successMsg} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reset-email" className="block text-xs font-semibold text-[#5A3224] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="reset-email"
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Reset Link...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Password Reset Email</span>
            </>
          )}
        </button>
      </form>
    </AuthCardLayout>
  );
};

export default ForgotPassword;
