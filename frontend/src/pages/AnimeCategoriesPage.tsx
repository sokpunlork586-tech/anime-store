import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { SectionHeading } from '../components/SectionHeading';
import { SafeImage } from '../components/SafeImage';

export const AnimeCategoriesPage: React.FC = () => {
  const { categories, products, settings } = useStore();

  const animeSeriesList = useMemo(() => {
    const map = new Map<string, { name: string; count: number; image: string }>();
    for (const p of products) {
      const series = (p.series || '').trim();
      if (!series) continue;
      const existing = map.get(series);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(series, {
          name: series,
          count: 1,
          image: p.image || settings.heroBannerImage || '',
        });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [products, settings.heroBannerImage]);

  return (
    <div className="pb-6 space-y-10">
      {/* Header */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#F7E5CE] border border-[#EAD3B8] px-6 py-7 sm:px-8">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F]">
          Explore Anime Universes
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#6B4235] max-w-2xl">
          Jump directly into your favorite shonen legends, slice-of-life classics, and hand-picked merchandise categories.
        </p>
      </div>

      {/* Browse by Anime Series (from database products) */}
      <section>
        <SectionHeading
          title="Popular Anime Series"
          subtitle="Select a franchise to view all figures, manga volumes, apparel, and accessories."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {animeSeriesList.map((universe) => {
            return (
              <Link
                key={universe.name}
                to={`/shop?series=${encodeURIComponent(universe.name)}`}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] shadow-xs hover:shadow-md hover:border-[#D96532]/50 hover:-translate-y-0.5 transition-all"
              >
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#FBF3E8] shrink-0">
                  <SafeImage
                    src={universe.image}
                    alt={universe.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-bold text-[#3D160F] group-hover:text-[#D96532] transition-colors">
                    {universe.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#724A3E] line-clamp-2">
                    Official {universe.name} merchandise & collectibles from store catalog.
                  </p>
                  <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-[#D96532]">
                    <span className="tabular-nums">{universe.count} collectibles</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Browse by Product Category */}
      <section>
        <SectionHeading
          title="Merchandise Categories"
          subtitle="Every category curated for collectors and everyday anime fans."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            return (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="group flex flex-col rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div
                  className="aspect-[4/3] w-full overflow-hidden p-4 flex items-center justify-center"
                  style={{ backgroundColor: cat.accentBg || '#F8E5CE' }}
                >
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold text-[#3D160F] group-hover:text-[#D96532] transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs font-semibold text-[#8E6453] tabular-nums">
                      {count} items
                    </span>
                  </div>
                  <p className="mt-1.5 text-xs text-[#724A3E] leading-relaxed flex-1">
                    {cat.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#D96532]">
                    Browse {cat.shortName}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
