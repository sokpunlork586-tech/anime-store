import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, History } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { formatDate } from '@/utils/formatters';
import type { InventoryItem, StockMovement } from '@/types';

export default function InventoryList() {
  const { inventory, stockMovements, updateStock } = useApp();
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [quantity, setQuantity] = useState('10');
  const [reason, setReason] = useState('Restock from supplier');
  const [showHistory, setShowHistory] = useState(false);

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) return;

    updateStock(adjustItem.productId, qty, adjustType, reason);
    setAdjustItem(null);
  };

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          {item.productImage ? (
            <img
              src={item.productImage}
              alt={item.productName}
              className="w-10 h-10 rounded-xl object-cover border border-border-light bg-secondary/40 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center font-bold text-primary flex-shrink-0">
              📦
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{item.productName}</p>
            <p className="text-xs text-text-muted">SKU: {item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (item: InventoryItem) => <span className="text-text-secondary">{item.category}</span>,
    },
    {
      key: 'currentStock',
      label: 'Current Stock',
      sortable: true,
      render: (item: InventoryItem) => (
        <span
          className={`font-bold ${
            item.currentStock === 0
              ? 'text-danger'
              : item.currentStock <= item.minStock
              ? 'text-warning'
              : 'text-text-primary'
          }`}
        >
          {item.currentStock} units
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: InventoryItem) => <StatusBadge status={item.status} />,
    },
    {
      key: 'lastRestocked',
      label: 'Last Restocked',
      sortable: true,
      render: (item: InventoryItem) => <span className="text-text-muted text-xs">{formatDate(item.lastRestocked)}</span>,
    },
  ];

  const movementColumns = [
    {
      key: 'productName',
      label: 'Product',
      render: (m: StockMovement) => <span className="font-semibold text-text-primary">{m.productName}</span>,
    },
    {
      key: 'type',
      label: 'Type',
      render: (m: StockMovement) => (
        <span
          className={`inline-flex items-center gap-1 font-semibold text-xs px-2.5 py-1 rounded-full ${
            m.type === 'in' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'
          }`}
        >
          {m.type === 'in' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
          {m.type === 'in' ? 'Stock In (+)' : 'Stock Out (-)'}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (m: StockMovement) => <span className="font-bold">{m.quantity}</span>,
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (m: StockMovement) => <span className="text-text-secondary text-xs">{m.reason}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      render: (m: StockMovement) => <span className="text-text-muted text-xs">{formatDate(m.date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Inventory Management</h1>
          {/* <p className="text-sm text-text-muted">Track product warehouse stock, restock levels, and audit log</p> */}
        </div>
        <Button
          variant="outline"
          icon={<History size={16} />}
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'View Stock List' : 'View Stock History'}
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
        {showHistory ? (
          <div>
            <h3 className="text-[18px] font-semibold text-text-primary mb-4">Stock Movement History</h3>
            <DataTable<StockMovement>
              data={stockMovements}
              columns={movementColumns}
              searchKeys={['productName', 'reason']}
              searchPlaceholder="Search movement history..."
              itemsPerPage={8}
            />
          </div>
        ) : (
          <DataTable<InventoryItem>
            data={inventory}
            columns={columns}
            searchKeys={['productName', 'sku', 'category']}
            searchPlaceholder="Search inventory by product, SKU..."
            itemsPerPage={8}
            actions={(item) => (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setAdjustItem(item);
                  setAdjustType('in');
                  setQuantity('10');
                  setReason('Restock from supplier');
                }}
              >
                Adjust Stock
              </Button>
            )}
          />
        )}
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={Boolean(adjustItem)}
        onClose={() => setAdjustItem(null)}
        title={`Adjust Stock: ${adjustItem?.productName}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Adjustment Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setAdjustType('in');
                  setReason('Restock from supplier');
                }}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  adjustType === 'in'
                    ? 'border-success bg-success-light text-success'
                    : 'border-border text-text-secondary hover:bg-background'
                }`}
              >
                <ArrowDownLeft size={16} /> Stock In (+)
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustType('out');
                  setReason('Damaged / Written off');
                }}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  adjustType === 'out'
                    ? 'border-danger bg-danger-light text-danger'
                    : 'border-border text-text-secondary hover:bg-background'
                }`}
              >
                <ArrowUpRight size={16} /> Stock Out (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Reason / Notes</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Supplier delivery PO-4021"
              className="w-full px-3.5 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
            <Button variant="ghost" type="button" onClick={() => setAdjustItem(null)}>
              Cancel
            </Button>
            <Button type="submit">Confirm Adjustment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
