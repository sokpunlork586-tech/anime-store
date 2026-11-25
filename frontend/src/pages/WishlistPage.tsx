import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { SafeImage } from '../components/SafeImage';
import { formatPrice } from '../utils/format';

export const WishlistPage: React.FC = () => {
  const { wishlist, products, toggleWishlist, addToCart, clearWishlist } = useStore();
  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  const moveAllToCart = () => {
    savedProducts.forEach((p) => {
      if (p.stock > 0) addToCart(p.id, 1, p.variants[0]);
    });
  };

  return (
    <div className="pb-8 space-y-6">
      <div className="rounded-2xl bg-[#F7E5CE] border border-[#EAD3B8] px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-[#3D160F]">My Wishlist</h1>
          <p className="mt-1 text-sm text-[#6B4235] tabular-nums">
            {savedProducts.length} saved collectible{savedProducts.length === 1 ? '' : 's'}
          </p>
        </div>

        {savedProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={moveAllToCart}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add All to Cart</span>
            </button>
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#DFC5AA] text-xs sm:text-sm font-semibold text-[#5E3224] hover:border-[#C62828] hover:text-[#C62828] cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {savedProducts.length === 0 ? (
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F7E5CE] text-[#D96532] flex items-center justify-center mx-auto">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold text-[#3D160F]">
            Your wishlist is empty
          </h2>
          <p className="mt-2 text-sm text-[#724A3E] max-w-md mx-auto">
            Tap the heart icon on any figure, manga set, or plushie to keep track of items for your collection.
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4 shadow-xs"
            >
              <div className="flex gap-4">
                <Link
                  to={`/product/${product.id}`}
                  className="w-24 h-24 rounded-xl overflow-hidden bg-[#FBF3E8] shrink-0"
                >
                  <SafeImage
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${product.id}`}
                    className="font-semibold text-[#3D160F] hover:text-[#D96532] line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-[#7E5546] mt-0.5">{product.series}</p>
                  <div className="mt-2 flex items-baseline gap-2 tabular-nums">
                    <span className="text-base font-bold text-[#C94825]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-[#A38477] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#2E7D32] font-medium">
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#F2E5D6] flex items-center gap-2">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => addToCart(product.id, 1, product.variants[0])}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] disabled:bg-[#DFC9B4] text-white text-xs font-semibold cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={`Remove ${product.name} from wishlist`}
                  className="px-3 py-2 rounded-xl border border-[#E7D3BE] text-[#7E5546] hover:text-[#C62828] hover:border-[#C62828] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
