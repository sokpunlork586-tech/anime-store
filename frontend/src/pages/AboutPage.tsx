import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, HeartHandshake, PackageCheck, Sparkles } from 'lucide-react';
import { STORE_ASSETS } from '../data/mockData';
import { useStore } from '../contexts/StoreContext';
import { SafeImage } from '../components/SafeImage';

export const AboutPage: React.FC = () => {
  const { settings, currentUser } = useStore();

  return (
    <div className="pb-10 space-y-10">
      {/* Editorial Story Banner */}
      <section className="rounded-3xl overflow-hidden bg-[#F7E5CE] border border-[#EAD3B8] grid grid-cols-1 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-7 p-7 sm:p-10 flex flex-col justify-center">
          <p className="text-xs font-semibold text-[#C85322]">Est. 2022 · Phnom Penh, Cambodia</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3D160F] leading-tight">
            Built by Collectors, For Every Anime Fan
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#5E3527] leading-relaxed">
            {settings.storeName} began as a weekend manga-swap table in Phnom Penh and grew into a dedicated storefront for authentic Japanese PVC figures, slipcase manga collections, embroidered streetwear haori, and cozy studio plushies.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold"
            >
              <span>Explore Store</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFFDF9] border border-[#DFC5AA] text-[#3D160F] hover:border-[#D96532] text-sm font-semibold"
            >
              <span>Visit Our Flagship</span>
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 min-h-[260px]">
          <SafeImage
            src={STORE_ASSETS.promoBanner}
            alt="Anime Store story artwork"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Key Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { value: '12,400+', label: 'Figures Delivered Safely' },
          { value: '100%', label: 'Licensed Authentic Stock' },
          { value: '4.9 / 5', label: 'Collector Satisfaction' },
          { value: '24 hrs', label: 'Phnom Penh Express Dispatch' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-5 text-center"
          >
            <p className="font-display text-2xl sm:text-3xl font-extrabold text-[#D96532] tabular-nums">
              {stat.value}
            </p>
            <p className="mt-1 text-xs sm:text-sm text-[#6B4235] font-medium">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Core Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            icon: Award,
            title: 'Verified Authenticity',
            body: 'We source directly from official Japanese distributors including Bandai Spirits, Banpresto, and Aniplex — never bootlegs.',
          },
          {
            icon: PackageCheck,
            title: 'Mint-Box Packaging',
            body: 'Every figure and manga slipcase is cushioned in double-walled kraft cartons with corner guards so your display box arrives pristine.',
          },
          {
            icon: HeartHandshake,
            title: 'Community First',
            body: 'From weekend cosplay meetups to Anime Club pre-order alerts, our store celebrates local fandom culture year-round.',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6"
            >
              <div className="w-11 h-11 rounded-xl bg-[#F7E5CE] text-[#D96532] flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="mt-4 font-display text-xl font-bold text-[#3D160F]">{item.title}</h2>
              <p className="mt-2 text-sm text-[#6B4235] leading-relaxed">{item.body}</p>
            </div>
          );
        })}
      </section>

      {/* Anime Club Section */}
      <section
        id="club"
        className="rounded-3xl bg-gradient-to-r from-[#FCE6C4] to-[#F7D7B2] border border-[#EBD1B2] p-6 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
      >
        <div className="md:col-span-4">
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm">
            <SafeImage
              src={STORE_ASSETS.clubHero}
              alt="Join Our Anime Club"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>
        <div className="md:col-span-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C85322]">
            <Sparkles className="w-4 h-4" />
            <span>Free Collector Membership</span>
          </div>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-[#3D160F]">
            Join Our Anime Club!
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#5E3527] leading-relaxed">
            Unlock automatic {settings.clubDiscountPercent}% member savings on every checkout, early access to limited numbered lithographs, and birthday surprise vouchers.
          </p>
          <div className="mt-5">
            <Link
              to={currentUser ? '/profile' : '/register'}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm"
            >
              <span>{currentUser ? 'View My Membership Card' : 'Create Free Club Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
