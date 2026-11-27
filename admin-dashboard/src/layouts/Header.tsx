import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, X, Send } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { getInitials, getRelativeTime } from '@/utils/formatters';

export default function Header() {
  const {
    setSidebarOpen,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotificationCount,
    telegramConfigured,
    sendTestTelegram,
    adminProfile,
  } = useApp();
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-border-light">
      <div className="flex items-center gap-4 px-4 md:px-6 h-16">
        {/* Mobile menu toggle */}
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-secondary/60 cursor-pointer">
          <Menu size={20} />
        </button>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search anything..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-text-muted transition-all"
            />
          </div>
        </div>

        {/* Mobile search toggle */}
        <button onClick={() => setSearchOpen(!searchOpen)} className="md:hidden p-2 rounded-lg hover:bg-secondary/60 cursor-pointer ml-auto">
          <Search size={20} />
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-secondary/60 cursor-pointer">
              <Bell size={20} className="text-text-secondary" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-border-light overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-border-light">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-text-primary">Notifications</h4>
                    {telegramConfigured && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        TG
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={testingTelegram}
                      onClick={async () => {
                        setTestingTelegram(true);
                        await sendTestTelegram();
                        setTestingTelegram(false);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer disabled:opacity-50"
                      title="Send a test notification to Telegram"
                    >
                      <Send size={12} />
                      <span>{testingTelegram ? 'Sending...' : 'Test TG'}</span>
                    </button>
                    {unreadNotificationCount > 0 && (
                      <button onClick={markAllNotificationsRead} className="text-xs text-text-muted hover:text-primary hover:underline cursor-pointer">
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border-light">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-text-muted text-center py-6">No notifications</p>
                  ) : notifications.slice(0, 5).map((n) => (
                    <button
                      key={n.id}
                      onClick={() => { markNotificationRead(n.id); }}
                      className={`w-full text-left px-4 py-3 hover:bg-secondary/20 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <p className={`text-sm ${!n.read ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{n.message}</p>
                      <p className="text-xs text-text-muted mt-1">{getRelativeTime(n.createdAt)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Admin avatar */}
          <Link
            to="/settings/profile"
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-secondary/40 transition-all cursor-pointer group"
            title="Edit Admin Profile & Settings"
          >
            <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-sm font-bold overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
              {adminProfile.avatar ? (
                <img src={adminProfile.avatar} alt={adminProfile.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(adminProfile.name)
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">{adminProfile.name}</p>
              <p className="text-[10px] text-text-muted">{adminProfile.role}</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile search */}
      {searchOpen && (
        <div className="md:hidden px-4 pb-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-muted"
              autoFocus
            />
          </div>
          <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} className="p-2 cursor-pointer">
            <X size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
