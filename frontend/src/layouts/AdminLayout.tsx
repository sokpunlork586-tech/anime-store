import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Boxes,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { ToastContainer } from '../components/ToastContainer';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../hooks/useAuth';

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: false },
  { to: '/admin/categories', label: 'Categories', icon: FolderKanban, end: false },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag, end: false },
  { to: '/admin/customers', label: 'Customers', icon: Users, end: false },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes, end: false },
  { to: '/admin/settings', label: 'Website Settings', icon: Settings, end: false },
];

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { orders, products } = useStore();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 10).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FFF8EF] text-[#3D160F] flex">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-[#FFFDF9] border-r border-[#EAD7C3] p-5">
        <div className="flex items-center justify-between mb-6">
          <BrandLogo layout="horizontal" size="sm" to="/" />
        </div>

        <p className="px-3 mb-2 text-xs font-semibold text-[#8E6453]">Store Management</p>

        <nav className="space-y-1 flex-1">
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const badge =
              item.label === 'Orders'
                ? pendingOrders
                : item.label === 'Inventory'
                  ? lowStockCount
                  : 0;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#D96532] text-white shadow-xs'
                      : 'text-[#4D2318] hover:bg-[#F7DCC3]/55'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {badge > 0 && (
                      <span
                        className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center tabular-nums ${
                          isActive ? 'bg-white text-[#D96532]' : 'bg-[#D96532]/15 text-[#C85322]'
                        }`}
                      >
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="pt-4 mt-4 border-t border-[#EFE0CE]">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#DFC7AE] text-sm font-semibold text-[#4D2318] hover:bg-[#F7DCC3]/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#3D160F]/45 backdrop-blur-[2px]"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[85vw] bg-[#FFFDF9] h-full flex flex-col p-5 border-r border-[#EAD7C3]">
            <div className="flex items-center justify-between mb-5">
              <BrandLogo layout="horizontal" size="sm" to="/" />
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg text-[#5E3224] hover:bg-[#F7DCC3]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1 flex-1">
              {ADMIN_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive ? 'bg-[#D96532] text-white' : 'text-[#4D2318] hover:bg-[#F7DCC3]/55'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="mt-4 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#DFC7AE] text-sm font-semibold text-[#4D2318]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Store</span>
            </Link>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-[#FFF8EF]/95 backdrop-blur-sm border-b border-[#EAD7C3] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin navigation"
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center text-[#3D160F] hover:bg-[#F7DCC3]/60 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold text-[#3D160F] leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-[#7E5546] hidden sm:block">
                Manage catalog, orders, inventory, and storefront settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {authUser?.email && (
              <span className="hidden md:inline-block text-xs font-medium text-[#7E5546] truncate max-w-[200px]">
                {authUser.email}
              </span>
            )}
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAD7C3] text-xs font-semibold text-[#4D2318] hover:border-[#D96532] hover:text-[#D96532] transition-colors whitespace-nowrap"
            >
              <span>View Store</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFDF9] border border-[#EAD7C3] text-xs font-semibold text-[#5E3224] hover:border-[#C62828] hover:text-[#C62828] transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1320px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
