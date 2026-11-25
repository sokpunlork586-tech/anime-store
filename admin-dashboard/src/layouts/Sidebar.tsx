import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderOpen, ShoppingCart, Users,
  Warehouse, Star, Settings, ExternalLink, LogOut, ChevronDown,
  ChevronLeft, CreditCard, DollarSign, UserCheck, Database,
  User, Palette, Store, Truck,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getInitials } from '@/utils/formatters';
import sidebarTorii from '@/assets/sidebar-torii.jpg';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/categories', icon: FolderOpen, label: 'Categories' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/inventory', icon: Warehouse, label: 'Inventory' },
  { path: '/reviews', icon: Star, label: 'Reviews' },
];

const settingSubItems = [
  { path: '/settings/profile', tab: 'profile', icon: User, label: 'Admin Profile' },
  { path: '/settings/branding', tab: 'branding', icon: Palette, label: 'Dashboard & Logo Branding' },
  { path: '/settings/store', tab: 'store', icon: Store, label: 'Store Information' },
  { path: '/settings/shipping', tab: 'shipping', icon: Truck, label: 'Shipping' },
];

const accountNavItems = [
  { path: '/accounts/payments', icon: CreditCard, label: 'Payment Accounts' },
  { path: '/accounts/financial', icon: DollarSign, label: 'Financial Accounts' },
  { path: '/accounts/users', icon: UserCheck, label: 'User Accounts' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed, logout, settings, adminProfile } = useApp();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(() => location.pathname.startsWith('/settings'));

  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setSettingsOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 z-40 h-screen bg-white border-r border-border-light flex flex-col transition-all duration-300
        ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-border-light ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            {settings.storeLogo ? (
              <img src={settings.storeLogo} alt="Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <span className="text-white text-lg font-bold">🏪</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h1 className="text-[14px] font-medium text-primary leading-tight truncate">
                {settings.storeName || 'ANIME STORE'}
              </h1>
              {settings.storeTagline && (
                <p className="text-[12px] text-text-muted truncate tracking-wider">{settings.storeTagline}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {/* Admin Panel Section */}
          <div>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-text-muted uppercase tracking-wider flex items-center justify-between">
                <span>Admin Panel</span>
              </p>
            )}
            <div className="space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${sidebarCollapsed ? 'justify-center' : ''}
                  ${isActive(path)
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:bg-secondary/50 hover:text-text-primary'
                  }`}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </NavLink>
            ))}

            {/* Settings Dropdown Accordion */}
            <div>
              <button
                type="button"
                onClick={() => {
                  if (sidebarCollapsed) {
                    navigate('/settings/profile');
                  } else {
                    setSettingsOpen(!settingsOpen);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 cursor-pointer
                  ${sidebarCollapsed ? 'justify-center' : ''}
                  ${location.pathname.startsWith('/settings')
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:bg-secondary/50 hover:text-text-primary'
                  }`}
                title={sidebarCollapsed ? 'Settings' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span>Settings</span>}
                </div>
                {!sidebarCollapsed && (
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      settingsOpen ? 'rotate-180' : ''
                    } ${location.pathname.startsWith('/settings') ? 'text-white' : 'text-text-muted'}`}
                  />
                )}
              </button>

              {/* Submenu Dropdown List */}
              {!sidebarCollapsed && settingsOpen && (
                <div className="mt-1 space-y-1 pl-3.5 py-1 ml-4 border-l-2 border-primary/20 animate-fade-in">
                  {settingSubItems.map(({ path, tab, icon: SubIcon, label }) => {
                    const isSubActive =
                      location.pathname === path ||
                      (location.pathname === '/settings' &&
                        (new URLSearchParams(location.search).get('tab') || 'profile') === tab);

                    return (
                      <button
                        key={path}
                        type="button"
                        onClick={() => {
                          navigate(path);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150 cursor-pointer text-left
                          ${isSubActive
                            ? 'bg-primary/10 text-primary shadow-xs'
                            : 'text-text-secondary hover:bg-secondary/40 hover:text-text-primary'
                          }`}
                      >
                        <SubIcon size={16} className="flex-shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Backup & Restore */}
            <NavLink
              to="/backup"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${sidebarCollapsed ? 'justify-center' : ''}
                ${isActive('/backup')
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-secondary/50 hover:text-text-primary'
                }`}
              title={sidebarCollapsed ? 'Backup & Restore' : undefined}
            >
              <Database size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>Backup & Restore</span>}
            </NavLink>
          </div>
        </div>

          {/* Accounts section */}
          <div className={`mt-4 ${sidebarCollapsed ? '' : 'pt-3 border-t border-border-light'}`}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-text-muted uppercase tracking-wider flex items-center justify-between">
                <span>Accounts</span>
              </p>
            )}
            <div className="space-y-1">
              {accountNavItems.map(({ path, icon: Icon, label }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${sidebarCollapsed ? 'justify-center' : ''}
                    ${isActive(path)
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-text-secondary hover:bg-secondary/50 hover:text-text-primary'
                    }`}
                  title={sidebarCollapsed ? label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarCollapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Website section */}
          <div className={`mt-6 ${sidebarCollapsed ? '' : 'pt-4 border-t border-border-light'}`}>
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-text-muted uppercase tracking-wider">Website</p>
            )}
            <a
              href="#"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-secondary/50 hover:text-text-primary transition-colors
                ${sidebarCollapsed ? 'justify-center' : ''}`}
              title={sidebarCollapsed ? 'View Store' : undefined}
            >
              <ExternalLink size={20} className="flex-shrink-0" />
              {!sidebarCollapsed && <span>View Store</span>}
            </a>
          </div>

          {/* Decorative Torii Gate & Pagoda Shrine Art matching reference */}
          {!sidebarCollapsed && (
            <div className="mt-4 px-2 select-none pointer-events-none">
              <div className="rounded-xl overflow-hidden opacity-90 border border-border-light/60">
                <img
                  src={sidebarTorii}
                  alt="Torii Shrine Art"
                  className="w-full h-24 object-cover object-center"
                />
              </div>
            </div>
          )}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex items-center justify-center p-2 mx-3 mb-2 rounded-lg hover:bg-secondary/60 text-text-muted transition-colors cursor-pointer"
        >
          <ChevronLeft size={18} className={`transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
        </button>

        {/* Admin profile */}
        <div className={`border-t border-border-light p-3 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
          {sidebarCollapsed ? (
            <div
              onClick={() => navigate('/settings/profile')}
              className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/40 transition"
              title={adminProfile.name}
            >
              {adminProfile.avatar ? (
                <img src={adminProfile.avatar} alt={adminProfile.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(adminProfile.name)
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold flex-shrink-0 overflow-hidden shadow-sm">
                  {adminProfile.avatar ? (
                    <img src={adminProfile.avatar} alt={adminProfile.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(adminProfile.name)
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{adminProfile.name}</p>
                  <p className="text-xs text-text-muted truncate">{adminProfile.role}</p>
                </div>
                <ChevronDown size={16} className={`text-text-muted transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileOpen && (
                <div className="space-y-1 mt-1 bg-white rounded-xl p-1 border border-border-light shadow-md">
                  <button
                    onClick={() => { navigate('/settings/profile'); setProfileOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-text-primary hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Settings size={15} className="text-primary" /> Edit Profile & Logo
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
