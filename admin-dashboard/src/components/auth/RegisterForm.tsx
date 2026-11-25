import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, UserPlus } from 'lucide-react';
import PasswordInput from './PasswordInput';
import { useApp } from '@/contexts/AppContext';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { addToast } = useApp();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

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

    if (!agreeTerms) {
      newErrors.terms = 'You must agree to the Terms & Privacy';
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
      addToast('Registration successful! Welcome to Anime Store.', 'success');
      navigate('/');
    }, 900);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 w-full">
      {/* Full Name */}
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <User size={18} />
          </div>
          <input
            id="register-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className={`w-full pl-10 pr-4 py-2.5 bg-white text-text-primary placeholder:text-text-muted/70 text-sm rounded-xl border transition-all duration-200 outline-none
              ${
                errors.fullName
                  ? 'border-danger focus:ring-2 focus:ring-danger/20'
                  : 'border-border/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
          />
        </div>
        {errors.fullName && <p className="text-xs text-danger font-medium mt-1 pl-1">{errors.fullName}</p>}
      </div>

      {/* Email Address */}
      <div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
            <Mail size={18} />
          </div>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className={`w-full pl-10 pr-4 py-2.5 bg-white text-text-primary placeholder:text-text-muted/70 text-sm rounded-xl border transition-all duration-200 outline-none
              ${
                errors.email
                  ? 'border-danger focus:ring-2 focus:ring-danger/20'
                  : 'border-border/80 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20'
              }`}
          />
        </div>
        {errors.email && <p className="text-xs text-danger font-medium mt-1 pl-1">{errors.email}</p>}
      </div>

      {/* Password */}
      <PasswordInput
        id="register-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        error={errors.password}
      />

      {/* Confirm Password */}
      <PasswordInput
        id="register-confirm-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm Password"
        error={errors.confirmPassword}
      />

      {/* Terms Agreement */}
      <div>
        <label className="flex items-start gap-2 text-xs text-text-secondary cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 accent-primary cursor-pointer mt-0.5"
          />
          <span>
            I agree to the{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline font-medium">
              Privacy Policy
            </a>
          </span>
        </label>
        {errors.terms && <p className="text-xs text-danger font-medium mt-1 pl-1">{errors.terms}</p>}
      </div>

      {/* Register Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <UserPlus size={18} />
            <span>Create Account</span>
          </>
        )}
      </button>

      {/* Login Link */}
      <p className="text-center text-xs text-text-secondary pt-2">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary-dark font-semibold transition-colors"
        >
          Login
        </Link>
      </p>
    </form>
  );
}
