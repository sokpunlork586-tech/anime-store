import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Users, DollarSign, Calendar, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { dashboardApi, type DashboardOverview } from '@/services/dashboardApi';
import SalesChart from '@/components/charts/SalesChart';
import OrderStatusChart from '@/components/charts/OrderStatusChart';
import StatusBadge from '@/components/common/StatusBadge';
import { formatCurrency, formatFullDateTime } from '@/utils/formatters';
import dashboardFuji from '@/assets/dashboard-fuji.jpg';

const EMPTY_OVERVIEW: DashboardOverview = {
  stats: {
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    orderGrowth: 0,
    productGrowth: 0,
    customerGrowth: 0,
    revenueGrowth: 0,
  },
  salesOverview: [],
  orderStatus: [
    { status: 'Completed', count: 0, percentage: 0, color: '#16A34A' },
    { status: 'Processing', count: 0, percentage: 0, color: '#3B82F6' },
    { status: 'Pending', count: 0, percentage: 0, color: '#F59E0B' },
    { status: 'Cancelled', count: 0, percentage: 0, color: '#A855F7' },
  ],
  topProducts: [],
  recentOrders: [],
};

export default function Dashboard() {
  const { adminProfile } = useApp();
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [overview, setOverview] = useState<DashboardOverview>(EMPTY_OVERVIEW);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchOverview = useCallback(async (range: string) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await dashboardApi.getOverview(range);
      setOverview(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load dashboard data from database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(timeRange);
  }, [timeRange, fetchOverview]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('anime_store_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER') {
          fetchOverview(timeRange);
        }
      };
    } catch {
      // BroadcastChannel not supported
    }
    return () => channel?.close();
  }, [timeRange, fetchOverview]);

  const { stats, salesOverview, orderStatus, topProducts, recentOrders } = overview;
  const maxSold = Math.max(...topProducts.map((p) => p.unitsSold), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Japanese Mountain Art Vibe */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFF0E0] via-[#FDE3CF] to-[#FCEADE] p-6 border border-[#F0D9C4] shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none opacity-45 mix-blend-multiply overflow-hidden">
          <img
            src={dashboardFuji}
            alt="Mount Fuji Banner"
            className="w-full h-full object-cover object-right"
          />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-[24px] font-semibold text-text-primary">Dashboard</h1>
            <p className="text-[14px] font-normal text-text-secondary mt-1 flex items-center gap-1.5">
              Welcome back, {adminProfile.name}! <span className="text-xl">👋</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchOverview(timeRange)}
              disabled={isLoading}
              className="flex items-center gap-1.5 bg-white/90 backdrop-blur px-3.5 py-2 rounded-xl border border-border text-[14px] font-medium text-text-primary shadow-sm hover:bg-white cursor-pointer transition disabled:opacity-60"
              title="Refresh from PostgreSQL database"
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin text-primary' : 'text-primary'} />
              <span>Refresh</span>
            </button>

            <div className="relative inline-block">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-3.5 py-2 rounded-xl border border-border text-[14px] font-medium text-text-primary shadow-sm hover:bg-white cursor-pointer transition">
                <Calendar size={16} className="text-primary" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer pr-2 text-text-primary font-medium"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="rounded-xl bg-danger-light border border-danger/20 px-4 py-3 text-[14px] font-normal text-danger flex items-center justify-between">
          <span>Database connection error: {loadError}</span>
          <button
            type="button"
            onClick={() => fetchOverview(timeRange)}
            className="text-[14px] font-medium underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F78F54] flex items-center justify-center text-white shadow-sm">
              <ShoppingCart size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Total Orders</p>
              <h3 className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">
                {stats.totalOrders.toLocaleString()}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${stats.orderGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                <span>{stats.orderGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.orderGrowth)}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E69A68] flex items-center justify-center text-white shadow-sm">
              <Package size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Total Products</p>
              <h3 className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">
                {stats.totalProducts.toLocaleString()}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${stats.productGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                <span>{stats.productGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.productGrowth)}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#E57388] flex items-center justify-center text-white shadow-sm">
              <Users size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Total Customers</p>
              <h3 className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">
                {stats.totalCustomers.toLocaleString()}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${stats.customerGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                <span>{stats.customerGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.customerGrowth)}%</span>
              </p>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm hover:shadow-md transition">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#2FB36C] flex items-center justify-center text-white shadow-sm">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-text-muted">Total Revenue</p>
              <h3 className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">
                {formatCurrency(stats.totalRevenue)}
              </h3>
              <p className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${stats.revenueGrowth >= 0 ? 'text-success' : 'text-danger'}`}>
                <span>{stats.revenueGrowth >= 0 ? '↑' : '↓'} {Math.abs(stats.revenueGrowth)}%</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section: Sales Chart & Order Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesChart data={salesOverview} />
        </div>
        <div>
          <OrderStatusChart data={orderStatus} total={stats.totalOrders} />
        </div>
      </div>

      {/* Bottom Section: Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-border-light shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              <h3 className="text-[18px] font-semibold text-text-primary">Recent Orders</h3>
            </div>
            <Link
              to="/orders"
              className="text-[14px] font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-[14px] font-normal text-text-muted text-center py-8">
              No orders recorded in this period.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14px] font-normal">
                <thead>
                  <tr className="border-b border-border-light text-left text-[14px] font-medium text-text-muted">
                    <th className="pb-3 font-medium">Order #</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Order Placed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light text-[14px] font-normal">
                  {recentOrders.map((order) => {
                    const dt = formatFullDateTime(order.createdAt);
                    return (
                      <tr key={order.id} className="hover:bg-background/50 transition">
                        <td className="py-3 font-normal text-text-primary">
                          <Link to={`/orders/${order.id}`} className="text-primary hover:underline font-medium">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 text-text-secondary">{order.customerName}</td>
                        <td className="py-3 font-normal text-text-primary tabular-nums">{formatCurrency(order.totalAmount)}</td>
                        <td className="py-3">
                          <StatusBadge status={order.status} size="sm" />
                        </td>
                        <td className="py-3 text-text-muted text-[14px] font-normal whitespace-nowrap">
                          <span className="text-text-primary block">{dt.date}</span>
                          <span className="text-[12px] text-text-muted flex items-center gap-1 mt-0.5">
                            <Clock size={11} className="text-accent flex-shrink-0" />
                            {dt.time || '12:00:00 AM'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h3 className="text-[18px] font-semibold text-text-primary">Top Products</h3>
            </div>
            <Link
              to="/products"
              className="text-[14px] font-medium text-primary hover:text-primary-dark flex items-center gap-1 transition"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-[14px] font-normal text-text-muted text-center py-8">
              No products found in database.
            </p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => {
                const progressPct = Math.min(100, Math.round((product.unitsSold / maxSold) * 100));
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover border border-border-light bg-secondary/40 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-secondary/50 border border-border-light flex items-center justify-center text-lg flex-shrink-0 font-bold text-primary">
                        📦
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[14px] font-medium text-text-primary truncate">{product.name}</p>
                        <span className="text-xs font-semibold text-text-primary ml-2 shrink-0">{product.unitsSold} sold</span>
                      </div>
                      <p className="text-xs text-text-muted mb-1.5">({product.category})</p>
                      <div className="w-full bg-secondary/40 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
