import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { SafeImage } from '../components/SafeImage';
import { formatPrice } from '../utils/format';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    cartSubtotal,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    settings,
    currentUser,
    showToast,
  } = useStore();
  const navigate = useNavigate();

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; percent: number } | null>(
    currentUser?.clubMember
      ? { code: 'ANIMECLUB', percent: settings.clubDiscountPercent }
      : null
  );

  const detailedItems = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const shippingFee =
    cartSubtotal === 0 || cartSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.standardShippingFee;
  const discountAmount = appliedPromo ? (cartSubtotal * appliedPromo.percent) / 100 : 0;
  const total = Math.max(0, cartSubtotal + shippingFee - discountAmount);
  const amountToFreeShipping = Math.max(0, settings.freeShippingThreshold - cartSubtotal);
  const freeShippingProgress = Math.min(100, (cartSubtotal / settings.freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (code === 'ANIME10' || code === 'ANIMECLUB') {
      setAppliedPromo({ code, percent: 10 });
      showToast('Promo applied', `10% discount (${code}) applied to your order.`);
    } else if (code === 'OTAKU15') {
      setAppliedPromo({ code, percent: 15 });
      showToast('Promo applied', '15% collector discount applied!');
    } else {
      showToast('Invalid code', 'Try ANIME10 or OTAKU15 for a discount.', 'error');
    }
  };

  if (detailedItems.length === 0) {
    return (
      <div className="pb-10">
        <div className="rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-12 text-center max-w-2xl mx-auto my-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F7E5CE] text-[#D96532] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-extrabold text-[#3D160F]">
            Your Shopping Cart is Empty
          </h1>
          <p className="mt-2 text-sm text-[#724A3E] max-w-md mx-auto">
            Looks like you haven&apos;t added any figures, manga volumes, or plushies yet. Start exploring our latest drops!
          </p>
          <Link
            to="/shop"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm"
          >
            <span>Browse Shop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F]">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-[#724A3E] tabular-nums">
            {detailedItems.length} item type{detailedItems.length === 1 ? '' : 's'} ready for checkout
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="self-start sm:self-auto text-xs font-semibold text-[#8E5341] hover:text-[#C62828] cursor-pointer"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress */}
      <div className="rounded-2xl bg-[#F7E5CE]/80 border border-[#EAD3B8] p-4">
        <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-medium text-[#4D2318]">
          <span className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D96532] shrink-0" />
            {amountToFreeShipping === 0 ? (
              <span>
                You unlocked <strong>Free Express Shipping</strong>!
              </span>
            ) : (
              <span>
                Add <strong className="tabular-nums">{formatPrice(amountToFreeShipping)}</strong> more for{' '}
                <strong>Free Shipping</strong>
              </span>
            )}
          </span>
          <span className="text-xs font-bold text-[#D96532] tabular-nums">
            {Math.round(freeShippingProgress)}%
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[#FFF8EF] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#D96532] transition-all duration-300"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-3.5">
          {detailedItems.map(({ product, quantity, variant }) => (
            <div
              key={`${product.id}-${variant || 'default'}`}
              className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] shadow-2xs"
            >
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
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/product/${product.id}`}
                      className="font-semibold text-[#3D160F] hover:text-[#D96532] transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-[#7E5546] mt-0.5">
                      {product.series}
                      {variant ? ` · ${variant}` : ''}
                    </p>
                  </div>
                  <p className="font-bold text-[#C94825] tabular-nums">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-xl border border-[#E7D2BC] bg-[#FFF8EF]">
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(product.id, quantity - 1, variant)}
                      aria-label="Decrease quantity"
                      className="w-8 h-8 flex items-center justify-center text-[#3D160F] hover:bg-[#F7DCC3]/60 rounded-l-xl cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-9 text-center text-sm font-bold tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateCartQuantity(product.id, quantity + 1, variant)}
                      aria-label="Increase quantity"
                      className="w-8 h-8 flex items-center justify-center text-[#3D160F] hover:bg-[#F7DCC3]/60 rounded-r-xl cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#8E6453] tabular-nums">
                      {formatPrice(product.price)} each
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id, variant)}
                      aria-label={`Remove ${product.name}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E5341] hover:text-[#C62828] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Card */}
        <aside className="lg:col-span-4 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 shadow-xs lg:sticky lg:top-6">
          <h2 className="font-display text-xl font-bold text-[#3D160F]">Order Summary</h2>

          {/* Promo Input */}
          <form onSubmit={handleApplyPromo} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-[#8E6453] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Promo code (ANIME10)"
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-xs text-[#3D160F] uppercase focus:outline-none focus:border-[#D96532]"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#3D160F] hover:bg-[#5E2314] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Apply
            </button>
          </form>

          {appliedPromo && (
            <div className="mt-2.5 flex items-center justify-between text-xs text-[#2E7D32] font-medium">
              <span>
                Code <strong>{appliedPromo.code}</strong> ({appliedPromo.percent}% off)
              </span>
              <button
                type="button"
                onClick={() => setAppliedPromo(null)}
                className="text-[#8E6453] hover:text-[#C62828] cursor-pointer"
              >
                Remove
              </button>
            </div>
          )}

          <dl className="mt-5 pt-4 border-t border-[#F2E5D6] space-y-2.5 text-sm tabular-nums">
            <div className="flex justify-between text-[#6B4235]">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-[#3D160F]">{formatPrice(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between text-[#6B4235]">
              <dt>Shipping</dt>
              <dd className="font-semibold text-[#3D160F]">
                {shippingFee === 0 ? (
                  <span className="text-[#2E7D32]">Free</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </dd>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#2E7D32]">
                <dt>Discount</dt>
                <dd className="font-semibold">-{formatPrice(discountAmount)}</dd>
              </div>
            )}
            <div className="pt-3 border-t border-[#EFE0CE] flex justify-between text-base font-extrabold text-[#3D160F]">
              <dt>Estimated Total</dt>
              <dd className="text-[#C94825]">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={() =>
              navigate('/checkout', {
                state: { discountAmount, promoCode: appliedPromo?.code || null },
              })
            }
            className="mt-6 w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <Link
            to="/shop"
            className="mt-3 block text-center text-xs font-semibold text-[#724A3E] hover:text-[#D96532]"
          >
            Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};
