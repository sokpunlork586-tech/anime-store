import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from '@/contexts/AppContext';
import AdminLayout from '@/layouts/AdminLayout';
import Dashboard from '@/pages/Dashboard';
import ProductList from '@/pages/Products/ProductList';
import ProductForm from '@/pages/Products/ProductForm';
import CategoryList from '@/pages/Categories/CategoryList';
import OrderList from '@/pages/Orders/OrderList';
import OrderDetail from '@/pages/Orders/OrderDetail';
import CustomerList from '@/pages/Customers/CustomerList';
import CustomerDetail from '@/pages/Customers/CustomerDetail';
import InventoryList from '@/pages/Inventory/InventoryList';
import ReviewList from '@/pages/Reviews/ReviewList';
import SettingsPage, { AdminProfile, DashboardBranding, StoreInformation, ShippingSettings } from '@/pages/Settings';
import BackupRestore from '@/pages/BackupRestore/BackupRestore';
import PaymentAccounts from '@/pages/Accounts/PaymentAccounts';
import FinancialAccounts from '@/pages/Accounts/FinancialAccounts';
import UserAccounts from '@/pages/Accounts/UserAccounts';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicAuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useApp();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes (Requires login first) */}
      <Route path="/login" element={<PublicAuthRoute><Login /></PublicAuthRoute>} />
      <Route path="/register" element={<PublicAuthRoute><Register /></PublicAuthRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Admin Routes (Requires password authentication) */}
      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
        <Route path="/products/:id/edit" element={<ProductForm />} />
        <Route path="/categories" element={<CategoryList />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/customers" element={<CustomerList />} />
        <Route path="/customers/:id" element={<CustomerDetail />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/reviews" element={<ReviewList />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/profile" element={<AdminProfile />} />
        <Route path="/settings/branding" element={<DashboardBranding />} />
        <Route path="/settings/store" element={<StoreInformation />} />
        <Route path="/settings/shipping" element={<ShippingSettings />} />
        <Route path="/backup" element={<BackupRestore />} />

        {/* Accounts Management Module Routes */}
        <Route path="/accounts/payments" element={<PaymentAccounts />} />
        <Route path="/accounts/financial" element={<FinancialAccounts />} />
        <Route path="/accounts/users" element={<UserAccounts />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
