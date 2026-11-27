import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { SafeImage } from '../../components/SafeImage';

export const PromoBanner: React.FC = () => {
  const { settings } = useStore();

  return (
    <section
      aria-label="Promotional banner"
      className="mt-10 sm:mt-12 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F7E2CA] border border-[#ECD4B9] shadow-[0_8px_26px_rgba(61,22,15,0.07)] min-h-[190px] sm:min-h-[215px] flex items-center justify-center"
    >
      <SafeImage
        src={settings.promoBannerImage || ''}
        alt={settings.promoBannerTitle}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* Soft center warm veil so typography remains crisp over cherry blossoms */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9E8D5]/30 via-[#FFF4E6]/88 to-[#F9E8D5]/35" />

      <div className="relative z-10 text-center px-6 py-8 max-w-xl mx-auto">
        <h2 className="font-display text-2xl sm:text-[32px] font-extrabold text-[#3D160F] leading-tight text-balance">
          {settings.promoBannerTitle}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-[#5E3527]">
          {settings.promoBannerSubtitle}
        </p>
        <Link
          to="/shop"
          className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] active:scale-[0.98] text-white text-sm font-semibold shadow-[0_5px_16px_rgba(217,101,50,0.3)] transition-all whitespace-nowrap"
        >
          <span>Explore Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
};
