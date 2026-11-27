import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { BrandLogo } from '../components/BrandLogo';

export const LoginPage: React.FC = () => {
  const { login } = useStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('john.doe@email.com');
  const [password, setPassword] = useState('anime123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error || 'Unable to sign in.');
      return;
    }
    navigate(res.user?.role === 'admin' ? '/admin' : '/profile');
  };

  const quickLogin = (demoEmail: string) => {
    const res = login(demoEmail, 'demo1234');
    if (res.ok) {
      navigate(res.user?.role === 'admin' ? '/admin' : '/profile');
    }
  };

  return (
    <div className="py-6 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-7 sm:p-9 shadow-sm">
        <div className="flex justify-center mb-5">
          <BrandLogo layout="stacked" size="sm" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F] text-center">
          Welcome Back
        </h1>
        <p className="mt-1.5 text-sm text-[#724A3E] text-center">
          Sign in to access your wishlist, orders, and Anime Club savings.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-[#C62828]/10 border border-[#C62828]/30 px-4 py-2.5 text-xs font-semibold text-[#A31E1E]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Account Shortcuts */}
        <div className="mt-6 pt-5 border-t border-[#F0E2D3]">
          <p className="text-xs font-semibold text-[#7E5546] text-center mb-3">
            Quick Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => quickLogin('john.doe@email.com')}
              className="py-2 px-3 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] hover:border-[#D96532] text-xs font-semibold text-[#3D160F] cursor-pointer"
            >
              Demo Customer
            </button>
            <button
              type="button"
              onClick={() => quickLogin('admin@animestore.com')}
              className="py-2 px-3 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] hover:border-[#D96532] text-xs font-semibold text-[#3D160F] cursor-pointer"
            >
              Demo Admin
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#724A3E]">
          New to Anime Store?{' '}
          <Link to="/register" className="font-semibold text-[#D96532] hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
};
