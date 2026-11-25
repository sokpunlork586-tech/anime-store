import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CheckCircle2,
  CreditCard,
  QrCode,
  Truck,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { Order } from '../types';
import { formatPrice } from '../utils/format';
import { SafeImage } from '../components/SafeImage';

export const CheckoutPage: React.FC = () => {
  const { cart, products, cartSubtotal, currentUser, settings, placeOrder } = useStore();
  const location = useLocation();
  const state = (location.state as { discountAmount?: number; promoCode?: string } | null) || {};

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [shippingAddress, setShippingAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || 'Phnom Penh');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('ABA Pay / KHQR');
  const [cardLast4, setCardLast4] = useState('4242');
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const detailedItems = cart
    .map((ci) => {
      const product = products.find((p) => p.id === ci.productId);
      return product ? { ...ci, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const defaultClubDiscount =
    state.discountAmount ??
    (currentUser?.clubMember ? (cartSubtotal * settings.clubDiscountPercent) / 100 : 0);
  const shippingFee =
    cartSubtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
  const total = Math.max(0, cartSubtotal + shippingFee - defaultClubDiscount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !customerName.trim() ||
      !customerEmail.trim() ||
      !customerPhone.trim() ||
      !shippingAddress.trim() ||
      !city.trim()
    ) {
      setError('Please complete all required shipping fields before placing your order.');
      return;
    }
    setError('');
    const created = placeOrder({
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      city: city.trim(),
      paymentMethod,
      discount: Number(defaultClubDiscount.toFixed(2)),
      notes: notes.trim() || undefined,
    });
    setConfirmedOrder(created);
  };

  // Order Confirmation State
  if (confirmedOrder) {
    return (
      <div className="pb-12 max-w-2xl mx-auto">
        <div className="rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 sm:p-9 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#2E7D32]/12 text-[#2E7D32] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <p className="mt-4 text-xs font-semibold text-[#D96532] font-mono">
            Order #{confirmedOrder.id} Confirmed
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-[#3D160F]">
            Thank You, {confirmedOrder.customerName}!
          </h1>
          <p className="mt-2 text-sm text-[#6B4235]">
            Your collectibles are being carefully bubble-wrapped and prepared for dispatch to{' '}
            <strong>{confirmedOrder.city}</strong>.
          </p>

          {/* Receipt Summary */}
          <div className="mt-6 rounded-2xl bg-[#FFF8EF] border border-[#EFE0CE] p-5 text-left">
            <div className="flex flex-wrap justify-between gap-2 text-xs text-[#7E5546] pb-3 border-b border-[#EAD7C3]">
              <span>Payment: {confirmedOrder.paymentMethod}</span>
              <span>Status: {confirmedOrder.status}</span>
            </div>

            <ul className="divide-y divide-[#F0E2D3] my-2">
              {confirmedOrder.items.map((item, idx) => (
                <li key={`${item.productId}-${idx}`} className="py-2.5 flex items-center gap-3">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3D160F] truncate">{item.name}</p>
                    <p className="text-xs text-[#7E5546]">
                      Qty {item.quantity} {item.variant ? `· ${item.variant}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#3D160F] tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-[#EAD7C3] flex justify-between text-base font-extrabold text-[#3D160F] tabular-nums">
              <span>Total Paid</span>
              <span className="text-[#C94825]">{formatPrice(confirmedOrder.total)}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/profile"
              className="px-6 py-2.5 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="px-6 py-2.5 rounded-full border border-[#DFC5AA] text-[#3D160F] hover:bg-[#F7DCC3]/50 text-sm font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (detailedItems.length === 0) {
    return (
      <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-12 text-center my-6">
        <h1 className="font-display text-2xl font-bold text-[#3D160F]">Nothing to Checkout</h1>
        <p className="mt-2 text-sm text-[#724A3E]">Add some anime items to your cart first.</p>
        <Link
          to="/shop"
          className="mt-5 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#D96532] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-10 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7E5546] hover:text-[#D96532] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D160F]">
            Checkout
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* Left Form Sections */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="rounded-xl bg-[#C62828]/10 border border-[#C62828]/30 px-4 py-3 text-sm font-medium text-[#A31E1E]">
              {error}
            </div>
          )}

          {/* Shipping Information */}
          <section className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#3D160F]">
              1. Shipping Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Sokha Chen"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="collector@animestore.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="No. 45, Street 240, Daun Penh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                  City / Province *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Phnom Penh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
                Delivery Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Double-box collector figures, call upon arrival..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </section>

          {/* Payment Method */}
          <section className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 space-y-4">
            <h2 className="font-display text-xl font-bold text-[#3D160F]">2. Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'ABA Pay / KHQR' as const,
                  label: 'ABA Pay / KHQR',
                  desc: 'Instant QR scan',
                  icon: QrCode,
                },
                {
                  id: 'Credit Card' as const,
                  label: 'Credit / Debit Card',
                  desc: 'Visa & Mastercard',
                  icon: CreditCard,
                },
                {
                  id: 'Cash on Delivery' as const,
                  label: 'Cash on Delivery',
                  desc: 'Pay at your door',
                  icon: Truck,
                },
              ].map((method) => {
                const Icon = method.icon;
                const active = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-[#D96532] bg-[#D96532]/8'
                        : 'border-[#E7D2BC] bg-[#FFF8EF] hover:border-[#D96532]/50'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${active ? 'text-[#D96532]' : 'text-[#7E5546]'}`}
                    />
                    <p className="mt-2 text-xs font-bold text-[#3D160F]">{method.label}</p>
                    <p className="text-[11px] text-[#7E5546]">{method.desc}</p>
                  </button>
                );
              })}
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Demo Card Ending
                  </label>
                  <input
                    type="text"
                    value={`•••• •••• •••• ${cardLast4}`}
                    onChange={(e) => setCardLast4(e.target.value.slice(-4))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    defaultValue="09/29"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm font-mono"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'Cash on Delivery' && (
              <p className="text-xs text-[#6B4235] bg-[#FFF8EF] rounded-xl p-3 border border-[#EFE0CE]">
                Total payable upon courier arrival: <strong className="tabular-nums">{formatPrice(total)}</strong>. Exact change appreciated.
              </p>
            )}
          </section>
        </div>

        {/* Right Order Summary */}
        <aside className="lg:col-span-5 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 shadow-xs lg:sticky lg:top-6">
          <h2 className="font-display text-xl font-bold text-[#3D160F] mb-4">
            Order Summary ({detailedItems.length})
          </h2>

          <ul className="divide-y divide-[#F2E5D6] max-h-72 overflow-y-auto pr-1">
            {detailedItems.map(({ product, quantity, variant }) => (
              <li key={`${product.id}-${variant}`} className="py-3 flex items-center gap-3">
                <SafeImage
                  src={product.image}
                  alt={product.name}
                  className="w-14 h-14 rounded-xl object-cover bg-[#FBF3E8] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#3D160F] truncate">{product.name}</p>
                  <p className="text-xs text-[#7E5546] truncate">
                    {quantity}× {variant || product.series}
                  </p>
                </div>
                <span className="text-sm font-bold text-[#3D160F] tabular-nums">
                  {formatPrice(product.price * quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 pt-4 border-t border-[#EFE0CE] space-y-2 text-sm tabular-nums">
            <div className="flex justify-between text-[#6B4235]">
              <dt>Subtotal</dt>
              <dd className="font-semibold text-[#3D160F]">{formatPrice(cartSubtotal)}</dd>
            </div>
            <div className="flex justify-between text-[#6B4235]">
              <dt>Shipping</dt>
              <dd className="font-semibold text-[#3D160F]">
                {shippingFee === 0 ? <span className="text-[#2E7D32]">Free</span> : formatPrice(shippingFee)}
              </dd>
            </div>
            {defaultClubDiscount > 0 && (
              <div className="flex justify-between text-[#2E7D32]">
                <dt>Discount {state.promoCode ? `(${state.promoCode})` : '(Anime Club)'}</dt>
                <dd className="font-semibold">-{formatPrice(defaultClubDiscount)}</dd>
              </div>
            )}
            <div className="pt-3 border-t border-[#EFE0CE] flex justify-between text-lg font-extrabold text-[#3D160F]">
              <dt>Total</dt>
              <dd className="text-[#C94825]">{formatPrice(total)}</dd>
            </div>
          </dl>

          <button
            type="submit"
            className="mt-6 w-full py-3.5 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-md transition-colors cursor-pointer"
          >
            Place Order · {formatPrice(total)}
          </button>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#7E5546]">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>Demo checkout — no real payment is charged</span>
          </p>
        </aside>
      </form>
    </div>
  );
};
