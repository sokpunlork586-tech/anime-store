import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../contexts/StoreContext';
import { SectionHeading } from '../../components/SectionHeading';
import { SafeImage } from '../../components/SafeImage';

export const CategoryStrip: React.FC = () => {
  const { categories } = useStore();

  return (
    <section aria-label="Shop by category" className="mt-8 sm:mt-10">
      <SectionHeading title="Shop By Category" />

      {/* Mobile horizontal scroll + Desktop 8-col grid */}
      <div className="flex lg:grid lg:grid-cols-8 gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-1 px-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={cat.slug === 'manga-books' ? '/manga' : `/shop?category=${cat.slug}`}
            className="group flex flex-col items-center shrink-0 w-[86px] sm:w-[104px] lg:w-auto text-center"
          >
            <div
              className="w-[78px] h-[78px] sm:w-[96px] sm:h-[96px] lg:w-full lg:aspect-square rounded-2xl overflow-hidden border border-[#EED9C2] shadow-[0_4px_14px_rgba(61,22,15,0.05)] group-hover:shadow-[0_8px_22px_rgba(217,101,50,0.16)] group-hover:-translate-y-0.5 group-hover:border-[#D96532]/50 transition-all duration-200 p-1.5"
              style={{ backgroundColor: cat.accentBg || '#F8E5CE' }}
            >
              <SafeImage
                src={cat.image}
                alt={cat.name}
                fallbackTitle={cat.shortName}
                className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="mt-2 text-xs sm:text-[13px] font-semibold text-[#3D160F] group-hover:text-[#D96532] transition-colors leading-tight">
              <span className="sm:hidden">{cat.shortName}</span>
              <span className="hidden sm:inline">{cat.name}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};
