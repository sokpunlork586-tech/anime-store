import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { HeroBanner } from '../features/home/HeroBanner';
import { CategoryStrip } from '../features/home/CategoryStrip';
import { PromoBanner } from '../features/home/PromoBanner';
import { SectionHeading } from '../components/SectionHeading';
import { ProductCard } from '../components/ProductCard';

export const HomePage: React.FC = () => {
  const { products } = useStore();
  const featuredProducts = products.filter((p) => p.featured).slice(0, 8);

  return (
    <div className="pb-4">
      <HeroBanner />

      <CategoryStrip />

      {/* Featured Products Section */}
      <section aria-label="Featured products" className="mt-10 sm:mt-12">
        <SectionHeading title="Featured Products" />

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-5">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-7 text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-[#DFC5AA] bg-[#FFFDF9] hover:border-[#D96532] hover:text-[#D96532] text-sm font-semibold text-[#4D2318] transition-colors"
          >
            <span>View Full Catalog ({products.length} items)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PromoBanner />
    </div>
  );
};
