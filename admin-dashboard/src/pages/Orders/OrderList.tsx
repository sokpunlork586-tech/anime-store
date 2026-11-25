import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Filter, RefreshCw, Calendar, Clock, Printer, Trash2 } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ExcelExportModal from '@/components/common/ExcelExportModal';
import ExcelImportModal from '@/components/common/ExcelImportModal';
import AnimeInvoiceModal from '@/components/orders/AnimeInvoiceModal';
import {
  exportOrdersToExcel,
  downloadOrdersTemplate,
  validateOrdersImport,
  orderExportColumns,
} from '@/utils/excelService';
import { formatCurrency, formatDate, formatFullDateTime } from '@/utils/formatters';
import type { Order } from '@/types';

export default function OrderList() {
  const navigate = useNavigate();
  const { orders, updateOrderStatus, deleteOrder, deleteOrders, refreshOrders, importOrders, addToast } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);

  const handleSyncOrders = async () => {
    setIsSyncing(true);
    try {
      await refreshOrders();
      addToast('Orders synced with backend database', 'success');
    } catch {
      addToast('Failed to sync orders with server', 'error');
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const filteredOrders = orders.filter((o) => {
    return selectedStatus === 'all' || o.status === selectedStatus;
  });

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order ID',
      sortable: true,
      render: (o: Order) => (
        <span
          className="font-semibold text-primary hover:underline cursor-pointer"
          onClick={() => navigate(`/orders/${o.id}`)}
        >
          {o.orderNumber}
        </span>
      ),
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true,
      render: (o: Order) => (
        <div>
          <p className="font-semibold text-text-primary">{o.customer.name}</p>
          <p className="text-xs text-text-muted">{o.customer.email}</p>
        </div>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (o: Order) => {
        const fullText = o.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');
        const previewText =
          o.items.length > 2
            ? `${o.items
                .slice(0, 2)
                .map((i) => `${i.productName} (x${i.quantity})`)
                .join(', ')}...`
            : fullText;

        return (
          <div className="flex items-center gap-1.5 max-w-[240px]" title={fullText}>
            <span className="truncate text-text-secondary text-xs">{previewText}</span>
            {o.items.length > 2 && (
              <span className="shrink-0 text-[11px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                +{o.items.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (o: Order) => (
        <span className="font-bold text-text-primary">{formatCurrency(o.totalAmount)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Order Status',
      sortable: true,
      render: (o: Order) => (
        <select
          value={o.status}
          onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
          className="text-xs font-semibold rounded-lg px-2 py-1 bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (o: Order) => <StatusBadge status={o.paymentStatus} />,
    },
    {
      key: 'createdAt',
      label: 'Order Date & Time',
      sortable: true,
      render: (o: Order) => {
        const dt = formatFullDateTime(o.createdAt);
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5 whitespace-nowrap">
              <Calendar size={12} className="text-primary flex-shrink-0" />
              {dt.date}
            </span>
            <span className="text-[11px] font-mono text-text-muted flex items-center gap-1 mt-0.5 whitespace-nowrap">
              <Clock size={11} className="text-accent flex-shrink-0" />
              {dt.time || '12:00:00 AM'}
            </span>
          </div>
        );
      },
    },
  ];

  // Handler for Excel Export
  const handleExport = ({
    exportMode,
    selectedColumns,
    fileName,
  }: {
    exportMode: 'all' | 'filtered' | 'selected';
    selectedColumns: string[];
    fileName: string;
  }) => {
    let rowsToExport: Order[] = [];
    if (exportMode === 'selected') {
      rowsToExport = orders.filter((o) => selectedOrderIds.includes(o.id));
    } else if (exportMode === 'filtered') {
      rowsToExport = filteredOrders;
    } else {
      rowsToExport = orders;
    }

    if (rowsToExport.length === 0) {
      addToast('No orders found to export', 'error');
      return;
    }

    exportOrdersToExcel(rowsToExport, fileName, selectedColumns);
    addToast(`Exported ${rowsToExport.length} order(s) to ${fileName}`, 'success');
  };

  // Handler for Excel Import
  const handleImport = (validRows: Order[], duplicateHandling: 'update' | 'skip') => {
    const result = importOrders(validRows, duplicateHandling);
    setSelectedOrderIds([]);
  };

  // Import preview columns
  const importPreviewColumns = [
    { key: 'orderNumber', label: 'Order #' },
    {
      key: 'customer',
      label: 'Customer',
      render: (o: Order) => o.customer.name,
    },
    {
      key: 'email',
      label: 'Email',
      render: (o: Order) => o.customer.email,
    },
    {
      key: 'totalAmount',
      label: 'Total ($)',
      render: (o: Order) => formatCurrency(o.totalAmount),
    },
    {
      key: 'status',
      label: 'Status',
      render: (o: Order) => <StatusBadge status={o.status} />,
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (o: Order) => <StatusBadge status={o.paymentStatus} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Orders Management</h1>
          {/* <p className="text-sm text-text-muted">Track, process, and manage incoming store customer orders</p> */}
        </div>

        {/* Action Buttons: Export, Import & Sync */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncOrders}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border bg-white hover:bg-secondary/40 text-text-secondary text-[14px] font-medium shadow-xs transition cursor-pointer"
            title="Fetch latest online orders from database"
          >
            <RefreshCw size={14} className={isSyncing ? 'animate-spin text-primary' : ''} />
            <span>Sync Orders</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 bg-white hover:bg-primary/5 text-primary text-[14px] font-medium shadow-sm transition cursor-pointer"
          >
            <span>📤</span>
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-accent text-white text-[14px] font-medium shadow-sm transition cursor-pointer"
          >
            <span>📥</span>
            <span>Import Excel</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
        <DataTable<Order>
          data={filteredOrders}
          columns={columns}
          searchKeys={['orderNumber', 'shippingAddress']}
          searchPlaceholder="Search order #, customer, address..."
          itemsPerPage={8}
          selectable={true}
          selectedIds={selectedOrderIds}
          onSelectChange={setSelectedOrderIds}
          bulkActions={
            <button
              type="button"
              onClick={() => setConfirmBulkDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-danger text-white text-[14px] font-medium hover:bg-danger/90 transition cursor-pointer"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedOrderIds.length})</span>
            </button>
          }
          filterSlot={
            <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
              <Filter size={14} className="text-text-muted" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          }
          actions={(order) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setInvoiceOrder(order)}
                title="Print Anime Invoice Template"
                className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition cursor-pointer"
              >
                <Printer size={16} />
              </button>
              <button
                onClick={() => navigate(`/orders/${order.id}`)}
                title="View Order Details"
                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-primary transition cursor-pointer"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(order)}
                title="Delete Order"
                className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      </div>

      {/* Single Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteOrder(deleteTarget.id);
            setSelectedOrderIds((prev) => prev.filter((id) => id !== deleteTarget.id));
            setDeleteTarget(null);
          }
        }}
        title="Delete Order"
        message={`Are you sure you want to delete order "${deleteTarget?.orderNumber}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={() => {
          deleteOrders(selectedOrderIds);
          setSelectedOrderIds([]);
          setConfirmBulkDelete(false);
        }}
        title="Delete Selected Orders"
        message={`Are you sure you want to delete ${selectedOrderIds.length} selected order(s)? This action cannot be undone.`}
        confirmLabel={`Delete (${selectedOrderIds.length})`}
        variant="danger"
      />

      {/* Export Modal */}
      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Orders to Excel"
        defaultFileName="orders_export.xlsx"
        columns={orderExportColumns}
        totalCount={orders.length}
        filteredCount={filteredOrders.length}
        selectedCount={selectedOrderIds.length}
        onExport={handleExport}
      />

      {/* Import Modal */}
      <ExcelImportModal<Order>
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        entityName="Orders"
        title="Import Orders from Excel"
        templateFileName="orders_template.xlsx"
        onDownloadTemplate={downloadOrdersTemplate}
        validateData={(rawRows) => validateOrdersImport(rawRows, orders)}
        onConfirmImport={handleImport}
        previewColumns={importPreviewColumns}
      />

      {/* Anime World Printable Invoice Template Modal */}
      {invoiceOrder && (
        <AnimeInvoiceModal
          order={invoiceOrder}
          isOpen={!!invoiceOrder}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
