import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, KeyRound } from 'lucide-react';
import PasswordInput from '@/components/auth/PasswordInput';
import AnimeStoreLogo from '@/components/auth/AnimeStoreLogo';
import authBg from '@/assets/auth-clean-bg.jpg';
import { useApp } from '@/contexts/AppContext';

export default function ResetPassword() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      addToast('Password reset successfully! Please login with your new password.', 'success');
      navigate('/login');
    }, 900);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-hidden bg-[#FFF8EF]">
      {/* Background Anime Illustration */}
      <div className="absolute inset-0 z-0">
        <img
          src={authBg}
          alt="Anime Store Background"
          className="w-full h-full object-cover object-left md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFF8EF]/20 to-[#FFF8EF]/80" />
      </div>

      {/* Floating Card */}
      <div className="relative z-10 w-full sm:w-[390px] md:w-[400px] bg-white/95 backdrop-blur-md rounded-[24px] p-5 sm:p-6 shadow-[0_15px_45px_rgba(61,22,15,0.16)] border border-[#F0D9C4]/80 flex flex-col items-center animate-scale-in">
        <div className="mb-3">
          <AnimeStoreLogo size="sm" />
        </div>

        <h2 className="text-[24px] font-semibold text-text-primary mb-2 text-center">
          Reset Your Password
        </h2>

        <p className="text-xs text-text-secondary text-center mb-6 max-w-xs">
          Choose a new, secure password for your Anime Store account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <PasswordInput
            id="reset-new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            error={errors.password}
          />

          <PasswordInput
            id="reset-confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            error={errors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <KeyRound size={16} />
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-6 mt-4 border-t border-border/80 w-full text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary font-medium transition-colors"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
