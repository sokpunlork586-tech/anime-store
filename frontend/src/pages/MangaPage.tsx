import React, { useMemo, useState } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { ProductCard } from '../components/ProductCard';
import { SafeImage } from '../components/SafeImage';

export const MangaPage: React.FC = () => {
  const { products, settings } = useStore();
  const [selectedSeries, setSelectedSeries] = useState('All');

  const mangaProducts = useMemo(
    () =>
      products.filter(
        (p) => p.categoryId === 'cat-manga' || p.categoryName.toLowerCase().includes('manga')
      ),
    [products]
  );

  const seriesTabs = useMemo(
    () => ['All', ...Array.from(new Set(mangaProducts.map((p) => p.series)))],
    [mangaProducts]
  );

  const visibleProducts = useMemo(
    () =>
      selectedSeries === 'All'
        ? mangaProducts
        : mangaProducts.filter((p) => p.series === selectedSeries),
    [mangaProducts, selectedSeries]
  );

  return (
    <div className="pb-6 space-y-8">
      {/* Editorial Manga Hero */}
      <section className="rounded-2xl sm:rounded-3xl overflow-hidden bg-[#F7E5CE] border border-[#EAD3B8] grid grid-cols-1 md:grid-cols-12 items-stretch">
        <div className="md:col-span-7 p-6 sm:p-9 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#C85322]">
            <BookOpen className="w-4 h-4" />
            <span>Curated Print Editions & Slipcase Box Sets</span>
          </div>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F] leading-tight">
            Manga & Collector Artbooks
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#5E3527] leading-relaxed max-w-xl">
            Every volume ships bagged and corner-protected in rigid cartons. Discover complete starter box sets, deluxe hardcover art chronicles, and English omnibus releases.
          </p>
          <div className="mt-5 flex flex-wrap gap-5 text-xs text-[#6B4235] pt-4 border-t border-[#E6CCB0]">
            <span>Acid-free archival print</span>
            <span aria-hidden="true">·</span>
            <span>Corner-guard packaging</span>
            <span aria-hidden="true">·</span>
            <span>Official English editions</span>
          </div>
        </div>
        <div className="md:col-span-5 bg-[#FBF3E8] min-h-[220px]">
          <SafeImage
            src={mangaProducts[0]?.image || settings.promoBannerImage || ''}
            alt="Collector Manga Box Set"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Series Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap p-1 rounded-xl bg-[#F7E5CE]/70 border border-[#EAD3B8]">
          {seriesTabs.map((series) => (
            <button
              key={series}
              type="button"
              onClick={() => setSelectedSeries(series)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedSeries === series
                  ? 'bg-[#D96532] text-white shadow-2xs'
                  : 'text-[#5A3224] hover:text-[#3D160F]'
              }`}
            >
              {series}
            </button>
          ))}
        </div>
        <p className="text-xs sm:text-sm text-[#724A3E] tabular-nums">
          {visibleProducts.length} manga edition{visibleProducts.length === 1 ? '' : 's'} available
        </p>
      </div>

      {/* Product Grid */}
      {visibleProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-10 text-center">
          <Sparkles className="w-8 h-8 text-[#D96532] mx-auto mb-2" />
          <p className="font-display text-xl font-bold text-[#3D160F]">No manga volumes in this filter</p>
          <button
            type="button"
            onClick={() => setSelectedSeries('All')}
            className="mt-4 px-5 py-2 rounded-full bg-[#D96532] text-white text-sm font-semibold cursor-pointer"
          >
            View All Manga
          </button>
        </div>
      )}
    </div>
  );
};
