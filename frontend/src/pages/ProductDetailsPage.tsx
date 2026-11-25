import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { SafeImage } from '../components/SafeImage';
import { ProductCard } from '../components/ProductCard';
import { SectionHeading } from '../components/SectionHeading';
import { calculateDiscountPercent, formatDate, formatPrice } from '../utils/format';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, isInWishlist, toggleWishlist, addReview, currentUser, settings } =
    useStore();

  const product = products.find((p) => p.id === id);

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review Form
  const [reviewAuthor, setReviewAuthor] = useState(currentUser?.name || '');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewError, setReviewError] = useState('');

  React.useEffect(() => {
    if (product) {
      setSelectedImageIdx(0);
      setSelectedVariant(product.variants[0] || '');
      setQuantity(1);
    }
  }, [product?.id]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.id !== product.id && (p.categoryId === product.categoryId || p.series === product.series))
      .slice(0, 4);
  }, [products, product]);

  if (!product) {
    return (
      <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-12 text-center my-6">
        <h1 className="font-display text-2xl font-bold text-[#3D160F]">Product Not Found</h1>
        <p className="mt-2 text-sm text-[#724A3E]">
          This collectible may have been removed or the link is outdated.
        </p>
        <Link
          to="/shop"
          className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D96532] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Shop</span>
        </Link>
      </div>
    );
  }

  const gallery = product.gallery.length > 0 ? product.gallery : [product.image];
  const activeImage = gallery[selectedImageIdx] || product.image;
  const wished = isInWishlist(product.id);
  const discountPct = calculateDiscountPercent(product.price, product.originalPrice);
  const outOfStock = product.stock <= 0;

  const handleBuyNow = () => {
    if (outOfStock) return;
    addToCart(product.id, quantity, selectedVariant || product.variants[0]);
    navigate('/checkout');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      setReviewError('Please enter your name and review comment.');
      return;
    }
    setReviewError('');
    addReview(product.id, {
      author: reviewAuthor.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
    });
    setReviewComment('');
    setReviewRating(5);
  };

  return (
    <div className="pb-10 space-y-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#7E5546] flex-wrap">
        <Link to="/" className="hover:text-[#D96532]">
          Home
        </Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-[#D96532]">
          Shop
        </Link>
        <span>/</span>
        <Link to={`/shop?series=${encodeURIComponent(product.series)}`} className="hover:text-[#D96532]">
          {product.series}
        </Link>
        <span>/</span>
        <span className="text-[#3D160F] font-semibold">{product.name}</span>
      </nav>

      {/* Main Contiguous Purchase Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-square rounded-3xl overflow-hidden bg-[#FBF3E8] border border-[#EFE0CE] shadow-xs">
            <SafeImage
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImageIdx(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden bg-[#FBF3E8] border-2 transition-all shrink-0 cursor-pointer ${
                    idx === selectedImageIdx
                      ? 'border-[#D96532] shadow-sm'
                      : 'border-[#EFE0CE] opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${product.name} view ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Sticky Purchase Details */}
        <div className="lg:col-span-6 rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 sm:p-8 shadow-xs lg:sticky lg:top-6">
          <div className="flex items-center gap-2 text-xs text-[#7E5546]">
            <span className="font-semibold text-[#D96532]">{product.series}</span>
            <span aria-hidden="true">·</span>
            <span>{product.categoryName}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F] leading-tight">
            {product.name}
          </h1>

          {/* Rating & Availability */}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 font-semibold text-[#3D160F] tabular-nums">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.rating)
                        ? 'fill-[#F5A623] text-[#F5A623]'
                        : 'text-[#DFC9B4]'
                    }`}
                  />
                ))}
              </div>
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-[#7E5546] font-normal">({product.reviewCount} reviews)</span>
            </div>

            <span className="text-[#DFC9B4]">|</span>

            <span
              className={`text-xs font-semibold ${
                outOfStock
                  ? 'text-[#C62828]'
                  : product.stock <= 10
                    ? 'text-[#C85322]'
                    : 'text-[#2E7D32]'
              }`}
            >
              {outOfStock
                ? 'Out of Stock'
                : product.stock <= 10
                  ? `Only ${product.stock} left in stock`
                  : `In Stock (${product.stock} ready to ship)`}
            </span>
          </div>

          {/* Price Block */}
          <div className="mt-5 flex items-baseline gap-3 tabular-nums">
            <span className="text-3xl font-extrabold text-[#C94825]">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-base text-[#A38477] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-xs font-bold text-[#2E7D32]">Save {discountPct}%</span>
              </>
            )}
          </div>

          <p className="mt-4 text-sm sm:text-[15px] text-[#5B3527] leading-relaxed">
            {product.description}
          </p>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-[#3D160F] mb-2.5">Edition / Option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedVariant === variant
                        ? 'border-[#D96532] bg-[#D96532]/10 text-[#C85322]'
                        : 'border-[#E7D3BE] bg-[#FFF8EF] text-[#4D2318] hover:border-[#D96532]/60'
                    }`}
                  >
                    {variant}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Primary Actions */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex items-center justify-between sm:justify-start rounded-xl border border-[#E5CEB6] bg-[#FFF8EF] px-2 h-12">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#3D160F] hover:bg-[#F7DCC3]/60 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold tabular-nums">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.max(1, product.stock), q + 1))}
                aria-label="Increase quantity"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#3D160F] hover:bg-[#F7DCC3]/60 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product.id, quantity, selectedVariant || product.variants[0])}
              className="flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] disabled:bg-[#DFC9B4] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{outOfStock ? 'Sold Out' : 'Add to Cart'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleWishlist(product.id)}
              aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
              className={`h-12 px-4 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${
                wished
                  ? 'border-[#D96532] bg-[#D96532]/10 text-[#D96532]'
                  : 'border-[#E5CEB6] bg-[#FFF8EF] text-[#5E3224] hover:border-[#D96532]'
              }`}
            >
              <Heart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
              <span className="sm:hidden">{wished ? 'Saved' : 'Wishlist'}</span>
            </button>
          </div>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleBuyNow}
            className="mt-3 w-full h-11 rounded-xl border border-[#3D160F] text-[#3D160F] hover:bg-[#3D160F] hover:text-[#FFF8EF] disabled:opacity-40 text-sm font-semibold transition-colors cursor-pointer"
          >
            Buy Now — Fast Checkout
          </button>

          {/* Trust Perks */}
          <div className="mt-6 pt-5 border-t border-[#F0E2D3] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-[#6B4235]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D96532] shrink-0" />
              <span>Free shipping over ${settings.freeShippingThreshold}</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D96532] shrink-0" />
              <span>100% Authentic Licensed</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#D96532] shrink-0" />
              <span>14-Day Collector Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications & Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Specifications */}
        <section className="lg:col-span-5 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6">
          <h2 className="font-display text-2xl font-bold text-[#3D160F] mb-4">Specifications</h2>
          <dl className="divide-y divide-[#F2E5D6] text-sm">
            {Object.entries(product.specifications).map(([key, val]) => (
              <div key={key} className="py-3 flex items-center justify-between gap-4">
                <dt className="text-[#7E5546]">{key}</dt>
                <dd className="font-semibold text-[#3D160F] text-right">{val}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Customer Reviews */}
        <section className="lg:col-span-7 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6">
          <h2 className="font-display text-2xl font-bold text-[#3D160F] mb-4">
            Collector Reviews ({product.reviews.length})
          </h2>

          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="text-sm text-[#7E5546]">
                Be the first collector to review {product.name}!
              </p>
            ) : (
              product.reviews.map((rev) => (
                <div key={rev.id} className="pb-4 border-b border-[#F2E5D6] last:border-b-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#3D160F]">{rev.author}</span>
                      {rev.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2E7D32]">
                          <Check className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#8E6453]">{formatDate(rev.date)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-[#DFC9B4]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-[#5B3527] leading-relaxed">{rev.comment}</p>
                </div>
              ))
            )}
          </div>

          {/* Write a Review Form */}
          <form onSubmit={handleReviewSubmit} className="mt-6 pt-5 border-t border-[#EFE0CE] space-y-3">
            <h3 className="text-sm font-bold text-[#3D160F]">Write a Review</h3>
            {reviewError && <p className="text-xs text-[#C62828] font-medium">{reviewError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={reviewAuthor}
                onChange={(e) => setReviewAuthor(e.target.value)}
                placeholder="Your name"
                className="px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC]">
                <span className="text-xs text-[#7E5546]">Rating:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setReviewRating(s)}
                    className="cursor-pointer"
                    aria-label={`Rate ${s} stars`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        s <= reviewRating ? 'fill-[#F5A623] text-[#F5A623]' : 'text-[#DFC9B4]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={3}
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share details about the sculpt, paint quality, or packaging..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-xs font-semibold cursor-pointer"
            >
              Submit Review
            </button>
          </form>
        </section>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <SectionHeading title="You May Also Like" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
