import React, { useMemo, useState } from 'react';
import { Flame } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const NewArrivalsPage: React.FC = () => {
  const { products } = useStore();
  const [tab, setTab] = useState<'all-new' | 'limited' | 'hot'>('all-new');

  const items = useMemo(() => {
    if (tab === 'limited') {
      return products.filter((p) => p.badge === 'Limited' || p.stock <= 10);
    }
    if (tab === 'hot') {
      return products.filter((p) => p.badge === 'Hot' || p.badge === 'Best Seller');
    }
    return [...products]
      .filter((p) => p.isNewArrival || p.badge === 'New Arrival')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [products, tab]);

  return (
    <div className="pb-6 space-y-6">
      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#F7E5CE] to-[#FCE9D4] border border-[#EAD3B8] px-6 py-7 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85322]">
            <Flame className="w-4 h-4" />
            <span>Fresh Weekly Studio Drops</span>
          </div>
          <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F]">
            New Arrivals
          </h1>
          <p className="mt-1.5 text-sm text-[#6B4235] max-w-xl">
            Just landed from Tokyo: newly sculpted PVC statues, embroidered haori jackets, and numbered collector lithographs.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FFFDF9] border border-[#EAD3B8] self-start md:self-auto">
          {[
            { id: 'all-new', label: 'Just Landed' },
            { id: 'limited', label: 'Limited Stock' },
            { id: 'hot', label: 'Trending Now' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as typeof tab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                tab === item.id
                  ? 'bg-[#D96532] text-white'
                  : 'text-[#5A3224] hover:text-[#3D160F]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
