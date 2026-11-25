import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import AnimeStoreLogo from '@/components/auth/AnimeStoreLogo';
import authBg from '@/assets/auth-clean-bg.jpg';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
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
          Forgot Password?
        </h2>

        {!submitted ? (
          <>
            <p className="text-xs text-text-secondary text-center mb-6 max-w-xs">
              Enter your registered email address and we'll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 w-full">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white text-text-primary placeholder:text-text-muted/70 text-sm rounded-xl border transition-all duration-200 outline-none
                      ${
                        error
                          ? 'border-danger focus:ring-2 focus:ring-danger/20'
                          : 'border-border/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
                      }`}
                  />
                </div>
                {error && <p className="text-xs text-danger font-medium mt-1 pl-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Reset Instructions</span>
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-success-light text-success rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <p className="text-sm font-semibold text-text-primary">Password Reset Link Sent!</p>
            <p className="text-xs text-text-muted max-w-xs">
              Check your inbox at <span className="font-semibold text-text-primary">{email}</span> for instructions to reset your password.
            </p>
            <Link
              to="/reset-password"
              className="inline-block text-xs font-semibold text-primary hover:underline mt-2"
            >
              Simulate Resetting Password &rarr;
            </Link>
          </div>
        )}

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
