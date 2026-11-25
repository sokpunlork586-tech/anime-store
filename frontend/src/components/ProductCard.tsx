import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../contexts/StoreContext';
import { formatPrice } from '../utils/format';
import { SafeImage } from './SafeImage';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

const BADGE_STYLES: Record<string, string> = {
  'Best Seller': 'bg-[#D96532] text-white',
  'New Arrival': 'bg-[#2E7D32] text-white',
  Hot: 'bg-[#C62828] text-white',
  Limited: 'bg-[#5E2314] text-[#FFF8EF]',
};

export const ProductCard: React.FC<ProductCardProps> = ({ product, compact = false }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const [justAdded, setJustAdded] = useState(false);
  const wished = isInWishlist(product.id);
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addToCart(product.id, 1, product.variants[0]);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <article className="group flex flex-col bg-[#FFFDF9] rounded-2xl border border-[#EFE0CE] p-2.5 sm:p-3 shadow-[0_4px_18px_rgba(61,22,15,0.04)] hover:shadow-[0_10px_28px_rgba(61,22,15,0.09)] hover:-translate-y-0.5 transition-all duration-200">
      {/* Image Frame */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#FBF3E8]">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <SafeImage
            src={product.image}
            alt={product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Subtle Tag matching reference */}
        {product.badge && (
          <span
            className={`absolute top-2.5 left-2.5 rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-xs ${
              BADGE_STYLES[product.badge] || 'bg-[#D96532] text-white'
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={wished ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer ${
            wished
              ? 'bg-[#D96532] text-white'
              : 'bg-white/90 text-[#8F533B] hover:bg-white hover:text-[#D96532]'
          }`}
        >
          <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 bg-[#3D160F]/45 flex items-center justify-center">
            <span className="bg-[#FFF8EF] text-[#3D160F] text-xs font-semibold px-3 py-1 rounded-md">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="mt-3 flex flex-1 flex-col">
        <Link
          to={`/product/${product.id}`}
          className="font-semibold text-[#3D160F] hover:text-[#D96532] transition-colors text-[15px] leading-snug line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-xs text-[#7E5546] mt-0.5 line-clamp-1">({product.series})</p>

        {/* Price + Rating Row */}
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5 tabular-nums">
            <span className="text-[16px] sm:text-[17px] font-bold text-[#C94825]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-[#A38477] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#3D160F] tabular-nums shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          disabled={outOfStock}
          onClick={handleAdd}
          className={`mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer whitespace-nowrap ${
            compact ? 'py-2 px-3' : 'py-2.5 px-4'
          } ${
            outOfStock
              ? 'bg-[#E5D5C4] text-[#8F7062] cursor-not-allowed'
              : justAdded
                ? 'bg-[#2E7D32] text-white'
                : 'bg-[#D96532] hover:bg-[#BF5223] active:scale-[0.98] text-white shadow-[0_3px_10px_rgba(217,101,50,0.25)]'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4 shrink-0" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
