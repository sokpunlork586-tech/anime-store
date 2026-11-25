import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { formatDate, formatPrice } from '../../utils/format';

export const AdminOverviewPage: React.FC = () => {
  const { products, categories, orders, customers } = useStore();

  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter((p) => p.stock <= 10);
  const recentOrders = orders.slice(0, 5);

  const categoryDistribution = categories.map((cat) => {
    const count = products.filter((p) => p.categoryId === cat.id).length;
    const pct = products.length > 0 ? Math.round((count / products.length) * 100) : 0;
    return { ...cat, count, pct };
  });

  const kpis = [
    {
      label: 'Total Revenue',
      value: formatPrice(totalRevenue),
      sub: `${orders.length} total orders`,
      icon: DollarSign,
    },
    {
      label: 'Catalog Products',
      value: String(products.length),
      sub: `${categories.length} active categories`,
      icon: Package,
    },
    {
      label: 'Registered Customers',
      value: String(customers.length),
      sub: `${customers.filter((c) => c.clubMember).length} Anime Club members`,
      icon: Users,
    },
    {
      label: 'Low Stock Alerts',
      value: String(lowStockProducts.length),
      sub: 'Items with ≤ 10 units',
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
          Dashboard Overview
        </h2>
        <p className="mt-1 text-sm text-[#724A3E]">
          Live store performance, inventory health, and recent customer orders.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-5 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#7E5546]">{kpi.label}</span>
                <div className="w-9 h-9 rounded-xl bg-[#F7E5CE] text-[#D96532] flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F] tabular-nums">
                {kpi.value}
              </p>
              <p className="mt-1 text-xs text-[#8E6453]">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <section className="xl:col-span-8 rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-bold text-[#3D160F]">Recent Orders</h3>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#D96532] hover:underline"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EFE0CE] text-xs text-[#7E5546]">
                  <th className="py-2.5 pr-4 font-semibold">Order ID</th>
                  <th className="py-2.5 pr-4 font-semibold">Customer</th>
                  <th className="py-2.5 pr-4 font-semibold">Date</th>
                  <th className="py-2.5 pr-4 font-semibold">Status</th>
                  <th className="py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4E9DC]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#FFF8EF]/70">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#3D160F]">
                      #{order.id}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-semibold text-[#3D160F]">{order.customerName}</p>
                      <p className="text-xs text-[#8E6453]">{order.items.length} item(s)</p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-[#6B4235] whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-xs font-semibold text-[#D96532]">
                      {order.status}
                    </td>
                    <td className="py-3 text-right font-bold text-[#3D160F] tabular-nums">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right Side: Category Distribution + Low Stock */}
        <div className="xl:col-span-4 space-y-6">
          <section className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6">
            <h3 className="font-display text-lg font-bold text-[#3D160F] mb-4">
              Catalog by Category
            </h3>
            <div className="space-y-3">
              {categoryDistribution.slice(0, 6).map((cat) => (
                <div key={cat.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-[#3D160F]">{cat.name}</span>
                    <span className="text-[#7E5546] tabular-nums">{cat.count} items</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#F5E7D7] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D96532]"
                      style={{ width: `${Math.max(8, cat.pct * 2.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg font-bold text-[#3D160F]">Low Stock Watch</h3>
              <Link
                to="/admin/inventory"
                className="text-xs font-semibold text-[#D96532] hover:underline"
              >
                Restock
              </Link>
            </div>
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#7E5546]">All catalog items have healthy stock levels.</p>
            ) : (
              <ul className="divide-y divide-[#F4E9DC] text-xs">
                {lowStockProducts.slice(0, 4).map((prod) => (
                  <li key={prod.id} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-semibold text-[#3D160F] truncate">{prod.name}</span>
                    <span
                      className={`font-bold tabular-nums shrink-0 ${
                        prod.stock === 0 ? 'text-[#C62828]' : 'text-[#C85322]'
                      }`}
                    >
                      {prod.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-2xl bg-[#F7E5CE]/80 border border-[#EAD3B8] p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-5 h-5 text-[#D96532]" />
          <p className="text-sm font-semibold text-[#3D160F]">
            Need to launch a new anime figure drop or update the sale banner?
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-xs font-semibold"
          >
            Add Product
          </Link>
          <Link
            to="/admin/settings"
            className="px-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#DFC5AA] text-[#3D160F] hover:border-[#D96532] text-xs font-semibold"
          >
            Edit Storefront Settings
          </Link>
        </div>
      </div>
    </div>
  );
};
