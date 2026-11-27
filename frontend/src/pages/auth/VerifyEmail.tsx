import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, LogOut, MailCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../contexts/StoreContext';
import { AuthAlert, AuthCardLayout } from '../../components/AuthFormElements';

export const VerifyEmail: React.FC = () => {
  const {
    user,
    isEmailVerified,
    role,
    resendVerification,
    refreshVerificationStatus,
    logout,
  } = useAuth();
  const { showToast } = useStore();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    if (isEmailVerified) {
      navigate(role === 'admin' ? '/admin' : '/profile', { replace: true });
    }
  }, [isEmailVerified, role, navigate]);

  const handleCheckStatus = async () => {
    setError('');
    setStatusMsg('');
    setChecking(true);
    try {
      const verified = await refreshVerificationStatus();
      if (verified) {
        showToast('Email Verified!', 'Welcome to Anime Store.');
        navigate(role === 'admin' ? '/admin' : '/profile', { replace: true });
      } else {
        setStatusMsg('Your email is not verified yet. Please click the link in your inbox first.');
      }
    } catch {
      setError('Unable to check verification status right now.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setStatusMsg('');
    setResending(true);
    const res = await resendVerification();
    setResending(false);

    if (!res.ok) {
      setError(res.error || 'Could not resend verification email.');
      return;
    }
    setStatusMsg(`Verification link re-sent to ${user?.email || 'your email'}.`);
    showToast('Verification Email Sent', 'Please check your inbox and spam folder.');
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AuthCardLayout
      title="Verify Your Email"
      subtitle={`We sent a verification email to ${user?.email || 'your email address'}.`}
    >
      <div className="mb-5 p-4 rounded-2xl bg-[#F7DCC3]/45 border border-[#EAD3B8] flex items-start gap-3">
        <MailCheck className="w-5 h-5 text-[#D96532] shrink-0 mt-0.5" />
        <p className="text-xs text-[#5A3224] leading-relaxed">
          Open the confirmation email from Firebase Authentication and click the verification link, then click{' '}
          <strong>I&apos;ve Verified My Email</strong> below.
        </p>
      </div>

      {error && <AuthAlert type="error" message={error} />}
      {statusMsg && <AuthAlert type="success" message={statusMsg} />}

      <div className="space-y-3">
        <button
          type="button"
          disabled={checking}
          onClick={handleCheckStatus}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking Status...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>I&apos;ve Verified My Email</span>
            </>
          )}
        </button>

        <button
          type="button"
          disabled={resending}
          onClick={handleResend}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FFF8EF] hover:bg-[#F7DCC3]/50 border border-[#E7D2BC] text-sm font-semibold text-[#3D160F] transition-colors cursor-pointer disabled:opacity-60"
        >
          {resending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Resend Verification Email</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-[#724A3E] hover:text-[#C62828] transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out &amp; use another email</span>
        </button>
      </div>
    </AuthCardLayout>
  );
};

export default VerifyEmail;
