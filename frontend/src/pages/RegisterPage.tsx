import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, Phone, User } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { BrandLogo } from '../components/BrandLogo';

export const RegisterPage: React.FC = () => {
  const { register, settings } = useStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = register({ name, email, phone, password });
    if (!res.ok) {
      setError(res.error || 'Could not create account.');
      return;
    }
    navigate('/profile');
  };

  return (
    <div className="py-6 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-7 sm:p-9 shadow-sm">
        <div className="flex justify-center mb-5">
          <BrandLogo layout="stacked" size="sm" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F] text-center">
          Join Our Anime Club
        </h1>
        <p className="mt-1.5 text-sm text-[#724A3E] text-center">
          Create a free account and enjoy {settings.clubDiscountPercent}% off every order.
        </p>

        {error && (
          <div className="mt-4 rounded-xl bg-[#C62828]/10 border border-[#C62828]/30 px-4 py-2.5 text-xs font-semibold text-[#A31E1E]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sovannara Meas"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+855 12 345 678"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
              Password (min. 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[#724A3E]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#D96532] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
