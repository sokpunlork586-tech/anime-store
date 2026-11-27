import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Heart,
  LogOut,
  MailWarning,
  Package,
  Save,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatPrice } from '../utils/format';
import { SafeImage } from '../components/SafeImage';

export const ProfilePage: React.FC = () => {
  const { currentUser, orders, wishlist, updateProfile, logout, settings } = useStore();
  const { user: authUser, isAdmin, isEmailVerified, logout: firebaseLogout } = useAuth();
  const navigate = useNavigate();

  const isSignedIn = Boolean(authUser || currentUser);
  const displayName =
    authUser?.displayName || currentUser?.name || authUser?.email?.split('@')[0] || 'Anime Collector';
  const displayEmail = authUser?.email || currentUser?.email || '';
  const joinedAt =
    currentUser?.joinedAt || authUser?.metadata?.creationTime || new Date().toISOString();

  const [tab, setTab] = useState<'orders' | 'details'>('orders');
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [city, setCity] = useState(currentUser?.city || '');

  useEffect(() => {
    setName((prev) => prev || displayName);
  }, [displayName]);

  const myOrders = useMemo(() => {
    if (!isSignedIn) return [];
    return orders.filter(
      (o) =>
        (currentUser && o.customerId === currentUser.id) ||
        (displayEmail && o.customerEmail.toLowerCase() === displayEmail.toLowerCase())
    );
  }, [orders, currentUser, isSignedIn, displayEmail]);

  if (!isSignedIn) {
    return (
      <div className="rounded-3xl bg-[#FFFDF9] border border-[#EFE0CE] p-12 text-center max-w-lg mx-auto my-8">
        <h1 className="font-display text-2xl font-bold text-[#3D160F]">Sign In to View Profile</h1>
        <p className="mt-2 text-sm text-[#724A3E]">
          Access your saved delivery address, order receipts, and Anime Club benefits.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-full bg-[#D96532] text-white text-sm font-semibold"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-full border border-[#DFC5AA] text-[#3D160F] text-sm font-semibold"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, phone, address, city });
  };

  const handleLogout = async () => {
    await firebaseLogout();
    logout();
    navigate('/');
  };

  return (
    <div className="pb-10 space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl bg-[#F7E5CE] border border-[#EAD3B8] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#D96532] text-white font-display text-2xl font-extrabold flex items-center justify-center shadow-sm shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
              {displayName}
            </h1>
            <p className="text-sm text-[#6B4235]">
              {displayEmail} · Member since {formatDate(joinedAt)}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs font-semibold">
              {authUser && (
                isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[#2E7D32]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Email Verified
                  </span>
                ) : (
                  <Link
                    to="/verify-email"
                    className="inline-flex items-center gap-1 text-[#B26A00] hover:underline"
                  >
                    <MailWarning className="w-3.5 h-3.5" /> Verify Email
                  </Link>
                )
              )}
              {currentUser?.clubMember && (
                <span className="inline-flex items-center gap-1 text-[#C85322]">
                  <Award className="w-3.5 h-3.5" /> Anime Club ({settings.clubDiscountPercent}% Off)
                </span>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1 text-[#2E7D32] hover:underline"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Open Admin Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#DFC5AA] text-xs font-semibold text-[#5E3224] hover:border-[#C62828] hover:text-[#C62828] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Quick Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4">
          <p className="text-xs text-[#7E5546]">Total Orders</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#3D160F] tabular-nums">
            {myOrders.length}
          </p>
        </div>
        <Link
          to="/wishlist"
          className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] hover:border-[#D96532] p-4 transition-colors"
        >
          <p className="text-xs text-[#7E5546] flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-[#D96532]" /> Saved Wishlist
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-[#3D160F] tabular-nums">
            {wishlist.length}
          </p>
        </Link>
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4">
          <p className="text-xs text-[#7E5546]">Total Spent</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#C94825] tabular-nums">
            {formatPrice(myOrders.reduce((sum, o) => sum + o.total, 0))}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-[#F7E5CE]/70 border border-[#EAD3B8] w-fit">
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'orders' ? 'bg-[#D96532] text-white' : 'text-[#5A3224] hover:text-[#3D160F]'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Order History</span>
        </button>
        <button
          type="button"
          onClick={() => setTab('details')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
            tab === 'details' ? 'bg-[#D96532] text-white' : 'text-[#5A3224] hover:text-[#3D160F]'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Address</span>
        </button>
      </div>

      {/* Tab Content */}
      {tab === 'orders' ? (
        <div className="space-y-4">
          {myOrders.length === 0 ? (
            <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-10 text-center">
              <p className="font-display text-xl font-bold text-[#3D160F]">No orders placed yet</p>
              <p className="mt-1 text-sm text-[#724A3E]">
                Once you complete a checkout, your order history and tracking status appear here.
              </p>
              <Link
                to="/shop"
                className="mt-5 inline-block px-6 py-2.5 rounded-full bg-[#D96532] text-white text-sm font-semibold"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            myOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F2E5D6] text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-[#3D160F]">#{order.id}</span>
                    <span className="text-[#8E6453]">{formatDate(order.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#D96532]">{order.status}</span>
                    <span className="font-bold text-[#3D160F] tabular-nums">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex items-center gap-3">
                      <SafeImage
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-sm font-semibold text-[#3D160F] hover:text-[#D96532] truncate block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[#7E5546]">
                          Qty {item.quantity} {item.variant ? `· ${item.variant}` : ''}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-[#3D160F] tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6 max-w-2xl space-y-4"
        >
          <h2 className="font-display text-xl font-bold text-[#3D160F]">Account Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">
              Shipping Address
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3224] mb-1.5">City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </form>
      )}
    </div>
  );
};
