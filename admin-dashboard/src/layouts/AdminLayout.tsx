import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '@/components/common/Toast';
import { useApp } from '@/contexts/AppContext';

export default function AdminLayout() {
  const { sidebarCollapsed, toasts, removeToast } = useApp();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        <Header />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
