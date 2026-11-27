import React, { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Gift,
  Heart,
  Home,
  Info,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../hooks/useAuth';
import { BrandLogo } from '../components/BrandLogo';
import { SafeImage } from '../components/SafeImage';
import { ToastContainer } from '../components/ToastContainer';
import { searchCatalogProducts } from '../utils/catalogSearch';
import { formatPrice } from '../utils/format';

const PRIMARY_NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/shop', label: 'Shop', icon: ShoppingBag, end: false },
  { to: '/about', label: 'About', icon: Info, end: false },
  { to: '/contact', label: 'Contact', icon: Mail, end: false },
];

export const StoreLayout: React.FC = () => {
  const { cartCount, wishlist, currentUser, products, settings, showToast } = useStore();
  const { user: authUser, isAuthenticated } = useAuth();
  const hasAccount = isAuthenticated || Boolean(currentUser);
  const accountDisplayName =
    authUser?.displayName || authUser?.email?.split('@')[0] || currentUser?.name || 'Collector';
  const accountEmail = authUser?.email || currentUser?.email || '';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const searchMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchCatalogProducts(products, searchQuery).items.slice(0, 5);
  }, [products, searchQuery]);

  const handleSearchSubmit = (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    setSearchFocused(false);
    setSearchDropdownOpen(false);
    navigate(q ? `/shop?q=${encodeURIComponent(q)}` : '/shop');
  };

  const handleSocialClick = (platform: string) => {
    showToast(`${platform} Community`, `Follow @animestore on ${platform} for weekly drops!`, 'info');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EF] text-[#3D160F] pb-16 lg:pb-0">
      {/* Top Announcement Bar (Desktop & Tablet) */}
      <div className="hidden md:block bg-[#F6E2CA] border-b border-[#EBD1B4] text-xs text-[#4D2318]">
        <div className="max-w-[1380px] mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href={`tel:${settings.phone}`}
              className="inline-flex items-center gap-1.5 hover:text-[#D96532] transition-colors whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-[#7A3F29]" />
              <span>{settings.phone}</span>
            </a>
            <span className="text-[#CFAF90]" aria-hidden="true">
              |
            </span>
            <a
              href={`mailto:${settings.email}`}
              className="inline-flex items-center gap-1.5 hover:text-[#D96532] transition-colors whitespace-nowrap"
            >
              <Mail className="w-3.5 h-3.5 text-[#7A3F29]" />
              <span>{settings.email}</span>
            </a>
            <span className="text-[#CFAF90] hidden lg:inline" aria-hidden="true">
              |
            </span>
            <span className="hidden lg:inline-flex items-center gap-1.5 font-medium whitespace-nowrap">
              <Truck className="w-3.5 h-3.5 text-[#7A3F29]" />
              <span>Free Shipping On Orders Over ${settings.freeShippingThreshold}</span>
            </span>
          </div>

          <Link
            to="/shop?sale=true"
            className="inline-flex items-center gap-1.5 font-semibold text-[#C85322] hover:text-[#A43E14] transition-colors whitespace-nowrap shrink-0"
          >
            <Gift className="w-3.5 h-3.5 text-[#D96532]" />
            <span>{settings.announcementText}</span>
          </Link>
        </div>
      </div>

      {/* Main Sticky Horizontal Menu Bar (Desktop, Tablet & Mobile) */}
      <header className="sticky top-0 z-30 bg-[#FFF8EF]/95 backdrop-blur-md border-b border-[#EFE0CE]">
        <div className="relative max-w-[1380px] mx-auto px-4 sm:px-6 h-16 lg:h-[72px] flex items-center justify-between gap-4 lg:gap-6">
          {/* Inline Mobile / Tablet Search Mode (replaces row content cleanly on the exact same Menu Bar row) */}
          {searchDropdownOpen && (
            <div className="lg:hidden absolute inset-0 z-20 bg-[#FFF8EF] px-4 sm:px-6 flex items-center gap-2.5">
              <form
                onSubmit={handleSearchSubmit}
                className="relative flex-1"
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 180)}
              >
                <Search className="w-4 h-4 text-[#8F6554] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anime figures, manga, keychains..."
                  autoFocus
                  className="w-full pl-10 pr-24 py-2 rounded-full bg-[#FFFDF9] border border-[#D96532] text-sm text-[#3D160F] placeholder:text-[#9D7968] focus:outline-none focus:ring-2 focus:ring-[#D96532]/15"
                />
                {searchQuery.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="absolute right-[72px] top-1/2 -translate-y-1/2 p-1 text-[#9D7968] hover:text-[#3D160F] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-xs font-semibold cursor-pointer transition-colors"
                >
                  Search
                </button>

                {/* Live Autocomplete Suggestions */}
                {searchFocused && searchQuery.trim().length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-[#FFFDF9] border border-[#EAD7C3] shadow-xl overflow-hidden z-40">
                    {searchMatches.length > 0 ? (
                      <div className="divide-y divide-[#F3E6D8]">
                        {searchMatches.map((prod) => (
                          <button
                            key={prod.id}
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setSearchFocused(false);
                              setSearchDropdownOpen(false);
                              setSearchQuery('');
                              navigate(`/product/${prod.id}`);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FFF5E8] transition-colors cursor-pointer"
                          >
                            <SafeImage
                              src={prod.image}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#3D160F] truncate">
                                {prod.name}
                              </p>
                              <p className="text-xs text-[#7E5546] truncate">
                                {prod.series} · {prod.categoryName}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-[#C94825] tabular-nums">
                              {formatPrice(prod.price)}
                            </span>
                          </button>
                        ))}
                        <button
                          type="submit"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            handleSearchSubmit(e);
                          }}
                          className="w-full py-2.5 text-center text-xs font-semibold text-[#D96532] hover:bg-[#FFF5E8] cursor-pointer"
                        >
                          View all results for &ldquo;{searchQuery}&rdquo; →
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-sm text-[#7E5546] text-center">
                        No products matched &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                  </div>
                )}
              </form>

              <button
                type="button"
                onClick={() => setSearchDropdownOpen(false)}
                aria-label="Close search"
                className="w-9 h-9 rounded-full bg-[#FFFDF9] border border-[#EAD7C3] flex items-center justify-center text-[#5E3224] hover:border-[#D96532] hover:text-[#D96532] shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Left: Mobile Hamburger + Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#3D160F] hover:bg-[#F7DCC3]/55 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo layout="horizontal" size="sm" />
          </div>

          {/* Center: Desktop Horizontal Menu Links */}
          <nav
            aria-label="Primary menu bar"
            className="hidden lg:flex items-center gap-1.5"
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative px-3.5 py-2 rounded-xl text-[14px] font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#D96532] text-white shadow-[0_4px_12px_rgba(217,101,50,0.24)]'
                      : 'text-[#4B2116] hover:bg-[#F7DCC3]/60 hover:text-[#3D160F]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Inline Search (LG+) & Utility Icons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Inline Search Input directly on the Menu Bar row for LG+ */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:block relative w-64 xl:w-80"
              onBlur={() => window.setTimeout(() => setSearchFocused(false), 180)}
            >
              <Search className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search figures, manga, keychains..."
                aria-label="Search for anime products"
                className="w-full pl-9 pr-24 py-2 rounded-full bg-[#FFFDF9] border border-[#EAD7C3] text-sm text-[#3D160F] placeholder:text-[#9D7A68] focus:outline-none focus:border-[#D96532] focus:ring-2 focus:ring-[#D96532]/15 transition-all"
              />
              {searchQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-[72px] top-1/2 -translate-y-1/2 p-1 text-[#9D7968] hover:text-[#3D160F] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3.5 py-1 rounded-full bg-[#D96532] hover:bg-[#BF5223] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Search
              </button>

              {/* Live Autocomplete Suggestions */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute right-0 top-full mt-2 w-80 xl:w-96 rounded-2xl bg-[#FFFDF9] border border-[#EAD7C3] shadow-xl overflow-hidden z-40">
                  {searchMatches.length > 0 ? (
                    <div className="divide-y divide-[#F3E6D8]">
                      {searchMatches.map((prod) => (
                        <button
                          key={prod.id}
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            setSearchFocused(false);
                            setSearchQuery('');
                            navigate(`/product/${prod.id}`);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FFF5E8] transition-colors cursor-pointer"
                        >
                          <SafeImage
                            src={prod.image}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#3D160F] truncate">
                              {prod.name}
                            </p>
                            <p className="text-xs text-[#7E5546] truncate">
                              {prod.series} · {prod.categoryName}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-[#C94825] tabular-nums">
                            {formatPrice(prod.price)}
                          </span>
                        </button>
                      ))}
                      <button
                        type="submit"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleSearchSubmit(e);
                        }}
                        className="w-full py-2.5 text-center text-xs font-semibold text-[#D96532] hover:bg-[#FFF5E8] cursor-pointer"
                      >
                        View all results for &ldquo;{searchQuery}&rdquo; →
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm text-[#7E5546] text-center">
                      No products matched &ldquo;{searchQuery}&rdquo;.
                    </div>
                  )}
                </div>
              )}
            </form>

            {/* Search Toggle Button (Mobile & Tablet < LG) */}
            <button
              type="button"
              onClick={() => setSearchDropdownOpen(true)}
              aria-label="Open product search"
              className="lg:hidden w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#EAD7C3] flex items-center justify-center text-[#4B2116] hover:border-[#D96532] hover:text-[#D96532] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Wishlist Icon (Desktop & Tablet) */}
            <Link
              to="/wishlist"
              aria-label={`Wishlist with ${wishlist.length} items`}
              className="hidden sm:flex relative w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#EAD7C3] items-center justify-center text-[#5E2A1A] hover:border-[#D96532] hover:text-[#D96532] transition-colors"
            >
              <Heart className="w-[18px] h-[18px]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D96532] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon */}
            <Link
              to="/cart"
              aria-label={`Shopping cart with ${cartCount} items`}
              className="relative w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#EAD7C3] flex items-center justify-center text-[#5E2A1A] hover:border-[#D96532] hover:text-[#D96532] transition-colors"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C62828] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account Icon (Desktop) */}
            <Link
              to={hasAccount ? '/profile' : '/login'}
              aria-label={hasAccount ? `Account (${accountDisplayName})` : 'Sign in'}
              className="hidden sm:flex w-10 h-10 rounded-full bg-[#FFFDF9] border border-[#EAD7C3] items-center justify-center text-[#3D6A46] hover:border-[#D96532] hover:text-[#D96532] transition-colors"
            >
              <User className="w-[18px] h-[18px]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Slide-over Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#3D160F]/45 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#FFF8EF] h-full flex flex-col border-r border-[#EFE0CE] shadow-2xl overflow-y-auto">
            <div className="p-4 flex items-center justify-between border-b border-[#EFE0CE]">
              <BrandLogo layout="horizontal" size="sm" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#5E3224] hover:bg-[#F7DCC3]/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="p-4 space-y-1 flex-1">
              {PRIMARY_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#D96532] text-white shadow-xs'
                          : 'text-[#4D2318] hover:bg-[#F7DCC3]/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <div className="my-3 border-t border-[#EFE0CE]" />

              <NavLink
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#D96532] text-white' : 'text-[#4D2318] hover:bg-[#F7DCC3]/60'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Heart className="w-4 h-4" />
                  Wishlist
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D96532] text-white tabular-nums">
                  {wishlist.length}
                </span>
              </NavLink>

              <NavLink
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? 'bg-[#D96532] text-white' : 'text-[#4D2318] hover:bg-[#F7DCC3]/60'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <ShoppingCart className="w-4 h-4" />
                  Cart
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#D96532] text-white tabular-nums">
                  {cartCount}
                </span>
              </NavLink>

              <NavLink
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#4D2318] hover:bg-[#F7DCC3]/60 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Admin & Settings</span>
              </NavLink>
            </nav>

            <div className="p-4 border-t border-[#EFE0CE]">
              {hasAccount ? (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-[#F7DCC3]/50 hover:bg-[#F7DCC3] transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-[#D96532] text-white font-bold flex items-center justify-center text-sm">
                    {accountDisplayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#3D160F] truncate">{accountDisplayName}</p>
                    <p className="text-xs text-[#724A3E] truncate">{accountEmail}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl bg-[#D96532] text-white text-sm font-semibold"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 rounded-xl border border-[#DFC7AE] text-sm font-semibold text-[#3D160F]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Full-Width Storefront Main Content */}
      <main className="flex-1 w-full max-w-[1380px] mx-auto px-4 sm:px-6 py-5 lg:py-6">
        <Outlet />
      </main>

      {/* Storefront Footer */}
      <footer className="mt-10 bg-[#F7E5CE] border-t border-[#EAD3B8]">
        <div className="max-w-[1380px] mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <BrandLogo layout="horizontal" size="md" tagline={settings.tagline} />
            <p className="mt-3 text-xs text-[#6B4235] leading-relaxed">
              Curated authentic anime figures, manga box sets, plushies, and collector merchandise.
            </p>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold text-[#3D160F] mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-[#5E3629]">
              <li>
                <Link to="/" className="hover:text-[#D96532] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-[#D96532] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/anime" className="hover:text-[#D96532] transition-colors">
                  Anime
                </Link>
              </li>
              <li>
                <Link to="/manga" className="hover:text-[#D96532] transition-colors">
                  Manga
                </Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-[#D96532] transition-colors">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold text-[#3D160F] mb-3">Customer Support</h3>
            <ul className="space-y-2 text-sm text-[#5E3629]">
              <li>
                <Link to="/contact#faq" className="hover:text-[#D96532] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact#shipping" className="hover:text-[#D96532] transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link to="/contact#returns" className="hover:text-[#D96532] transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#D96532] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-[#D96532] transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold text-[#3D160F] mb-3">Contact Us</h3>
            <ul className="space-y-2.5 text-sm text-[#5E3629]">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#7A3F29] shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#7A3F29] shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#7A3F29] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-sans text-sm font-bold text-[#3D160F] mb-3">Follow Us</h3>
            <div className="flex items-center gap-2.5">
              {[
                { name: 'Facebook', label: 'f' },
                { name: 'YouTube', label: '▶' },
                { name: 'Telegram', label: '✈' },
                { name: 'TikTok', label: '♪' },
              ].map((social) => (
                <button
                  key={social.name}
                  type="button"
                  onClick={() => handleSocialClick(social.name)}
                  aria-label={`Follow on ${social.name}`}
                  className="w-9 h-9 rounded-full bg-[#4B2116] hover:bg-[#D96532] text-[#FFF8EF] text-sm font-bold flex items-center justify-center transition-colors cursor-pointer"
                >
                  {social.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#6B4235]">
              New drops every Friday at 10:00 AM ICT.
            </p>
          </div>
        </div>

        <div className="bg-[#B86137] text-[#FFF8EF]">
          <div className="max-w-[1380px] mx-auto px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <p>© 2026 {settings.storeName}. All rights reserved.</p>
            <p className="font-medium">Shop Smart. Collect More.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile bottom navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFDF9]/98 backdrop-blur-md border-t border-[#EAD7C3] h-15 px-2 grid grid-cols-4 items-center"
      >
        {[
          { to: '/', label: 'Home', icon: Home, badge: 0 },
          { to: '/shop', label: 'Shop', icon: ShoppingBag, badge: 0 },
          { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: cartCount },
          { to: hasAccount ? '/profile' : '/login', label: 'Account', icon: User, badge: 0 },
        ].map((item) => {
          const Icon = item.icon;
          const active =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-xl transition-colors ${
                active ? 'text-[#D96532] font-semibold' : 'text-[#6B4235]'
              }`}
            >
              <span className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#C62828] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {item.badge}
                  </span>
                )}
              </span>
              <span className="text-[11px] leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <ToastContainer />
    </div>
  );
};
