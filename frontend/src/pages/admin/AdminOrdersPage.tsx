import React, { useMemo, useState } from 'react';
import { Eye, Search, Trash2, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Order, OrderStatus } from '../../types';
import { formatDate, formatPrice } from '../../utils/format';
import { SafeImage } from '../../components/SafeImage';
import { ConfirmModal } from '../../components/ConfirmModal';

const STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, deleteOrders } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const isAllSelected =
    filtered.length > 0 && filtered.every((o) => selectedIds.includes(o.id));
  const isPartiallySelected =
    filtered.some((o) => selectedIds.includes(o.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    const filteredIds = filtered.map((o) => o.id);
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
          Orders Management
        </h2>
        <p className="mt-1 text-sm text-[#724A3E] tabular-nums">
          Track shipments and update fulfillment statuses across {orders.length} customer orders.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7E5CE]/70 border border-[#EAD3B8] overflow-x-auto">
          {(['All', ...STATUSES] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#D96532] text-white'
                  : 'text-[#5A3224] hover:text-[#3D160F]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Order ID or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#D96532]/10 border border-[#D96532]/25 text-xs">
          <span className="font-semibold text-[#3D160F] tabular-nums">
            {selectedIds.length} order(s) selected
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#C62828] hover:bg-[#A31E1E] text-white font-semibold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-[#C85322] hover:underline font-semibold cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF0E4] border-b border-[#EFE0CE] text-xs text-[#6B4235]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all orders"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-[#DFC7AE] accent-[#D96532] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Order ID</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Total</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4E9DC]">
              {filtered.map((order) => {
                const isSelected = selectedIds.includes(order.id);
                return (
                <tr key={order.id} className={isSelected ? 'bg-[#D96532]/5 hover:bg-[#D96532]/10' : 'hover:bg-[#FFF8EF]/70'}>
                  <td className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label={`Select order ${order.id}`}
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(order.id)}
                      className="w-4 h-4 rounded border-[#DFC7AE] accent-[#D96532] cursor-pointer align-middle"
                    />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs font-bold text-[#3D160F]">
                    #{order.id}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#3D160F]">{order.customerName}</p>
                    <p className="text-xs text-[#8E6453]">{order.city}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#6B4235] whitespace-nowrap">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#5E3527] whitespace-nowrap">
                    {order.paymentMethod}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#C94825] tabular-nums">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      aria-label={`Change status for order ${order.id}`}
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#FFF8EF] border border-[#E5CEB6] text-xs font-semibold text-[#3D160F] focus:outline-none focus:border-[#D96532] cursor-pointer"
                    >
                      {STATUSES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        aria-label={`View order ${order.id}`}
                        className="p-2 rounded-lg text-[#5E3224] hover:bg-[#F7DCC3]/60 hover:text-[#D96532] cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(order)}
                        aria-label={`Delete order ${order.id}`}
                        className="p-2 rounded-lg text-[#5E3224] hover:bg-[#C62828]/10 hover:text-[#C62828] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-[#7E5546]">
                    No orders match your current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D160F]/45 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFDF9] border border-[#EAD7C3] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE0CE]">
              <div>
                <p className="font-mono text-xs font-bold text-[#D96532]">#{selectedOrder.id}</p>
                <h3 className="font-display text-xl font-bold text-[#3D160F]">Order Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#7E5546] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5E3527] bg-[#FFF8EF] p-4 rounded-2xl border border-[#EFE0CE]">
              <div>
                <p className="font-bold text-[#3D160F]">Customer</p>
                <p className="mt-1">{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerEmail}</p>
                <p>{selectedOrder.customerPhone}</p>
              </div>
              <div>
                <p className="font-bold text-[#3D160F]">Shipping & Payment</p>
                <p className="mt-1">{selectedOrder.shippingAddress}</p>
                <p>{selectedOrder.city}</p>
                <p className="font-semibold text-[#D96532] mt-1">{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-[#F2E5D6]">
              {selectedOrder.items.map((item, idx) => (
                <li key={`${item.productId}-${idx}`} className="py-3 flex items-center gap-3">
                  <SafeImage
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#3D160F] truncate">{item.name}</p>
                    <p className="text-xs text-[#7E5546]">
                      Qty {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-[#3D160F] tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-[#EFE0CE] flex items-center justify-between text-base font-extrabold text-[#3D160F] tabular-nums">
              <span>Order Total</span>
              <span className="text-[#C94825]">{formatPrice(selectedOrder.total)}</span>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Order"
        message={`Remove order #${deleteTarget?.id} for ${deleteTarget?.customerName}?`}
        confirmLabel="Delete Order"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteOrder(deleteTarget.id);
            setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
      />

      <ConfirmModal
        open={bulkDeleteOpen}
        title="Delete Selected Orders"
        message={`Remove ${selectedIds.length} selected order(s)? This action cannot be undone.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        destructive
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          deleteOrders(selectedIds);
          setSelectedIds([]);
          setBulkDeleteOpen(false);
        }}
      />
    </div>
  );
};
