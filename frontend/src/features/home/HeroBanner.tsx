import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { SafeImage } from '../../components/SafeImage';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  primaryCta: { label: string; to: string };
  secondaryCta: { label: string; to: string };
  image: string;
  imagePosition?: string;
}

export const HeroBanner: React.FC = () => {
  const { settings, products } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);

  const slides: HeroSlide[] = useMemo(() => {
    const firstFigure = products.find((p) => p.image)?.image || '';
    const mangaImg =
      products.find((p) => p.categoryName.toLowerCase().includes('manga'))?.image || firstFigure;
    return [
      {
        id: 'universe',
        title: 'Discover Your Favorite Anime Universe',
        subtitle: 'Explore anime figures, manga collections, collectibles, and exclusive merchandise.',
        primaryCta: { label: 'Shop Now', to: '/shop' },
        secondaryCta: { label: 'Explore Collection', to: '/anime' },
        image: settings.heroBannerImage || firstFigure,
        imagePosition: 'object-right',
      },
      {
        id: 'sakura-edition',
        title: 'Curated Figures & Collector Editions',
        subtitle: 'Hand-picked PVC statues, kimono editions, and museum-grade wall scrolls shipped with care.',
        primaryCta: { label: 'Browse Figures', to: '/shop?category=figures-statues' },
        secondaryCta: { label: 'New Arrivals', to: '/new-arrivals' },
        image: settings.promoBannerImage || firstFigure,
        imagePosition: 'object-center',
      },
      {
        id: 'manga-vault',
        title: 'Build Your Dream Manga Library',
        subtitle: 'Deluxe collector slipcase box sets, complete starter sagas, and full-color illustrated artbooks.',
        primaryCta: { label: 'Shop Manga', to: '/manga' },
        secondaryCta: { label: 'Join Anime Club', to: '/register' },
        image: settings.heroBannerImage || mangaImg,
        imagePosition: 'object-right',
      },
    ];
  }, [settings.heroBannerImage, settings.promoBannerImage, products]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const slide = slides[activeIndex];

  return (
    <section
      aria-label="Featured collections"
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F7E2C9] border border-[#EDD7BD] shadow-[0_10px_30px_rgba(61,22,15,0.08)] min-h-[260px] sm:min-h-[340px] lg:min-h-[385px] flex items-center"
    >
      {/* Background Artwork */}
      <SafeImage
        src={slide.image}
        alt={slide.title}
        className={`absolute inset-0 w-full h-full object-cover ${slide.imagePosition || 'object-right'} transition-opacity duration-500`}
      />

      {/* Soft Cream Left Scrim for high contrast editorial serif headline */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#F8E4CC] via-[#F8E4CC]/88 sm:via-[#F8E4CC]/75 to-transparent" />

      {/* Copy Content */}
      <div className="relative z-10 w-full px-6 sm:px-9 lg:px-12 py-8 sm:py-10 lg:py-12">
        <div className="max-w-lg">
          <h1 className="font-display text-[30px] sm:text-[42px] lg:text-[48px] font-extrabold text-[#3D160F] leading-[1.08] tracking-tight text-balance">
            {slide.title}
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-[15px] text-[#5B3527] leading-relaxed max-w-md">
            {slide.subtitle}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to={slide.primaryCta.to}
              className="inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#D96532] hover:bg-[#BF5223] active:scale-[0.98] text-white text-sm font-semibold shadow-[0_6px_18px_rgba(217,101,50,0.34)] transition-all whitespace-nowrap"
            >
              <span>{slide.primaryCta.label}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={slide.secondaryCta.to}
              className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 sm:py-3 rounded-full bg-[#FFF8EF]/70 hover:bg-[#FFF8EF] border border-[#BA9070] text-[#3D160F] text-sm font-semibold transition-all whitespace-nowrap"
            >
              <span>{slide.secondaryCta.label}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Carousel Dots */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to slide ${idx + 1}: ${s.title}`}
            className={`h-2.5 rounded-full transition-all duration-200 cursor-pointer ${
              idx === activeIndex
                ? 'w-7 bg-[#D96532]'
                : 'w-2.5 bg-white/80 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
