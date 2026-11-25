import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Trash2, Mail, Phone } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';
import type { Customer } from '@/types';

export default function CustomerList() {
  const navigate = useNavigate();
  const { customers, deleteCustomer, deleteCustomers } = useApp();
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const columns = [
    {
      key: 'name',
      label: 'Customer',
      sortable: true,
      render: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-xs flex-shrink-0">
            {getInitials(c.name)}
          </div>
          <div>
            <p className="font-semibold text-text-primary">{c.name}</p>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Mail size={12} /> {c.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (c: Customer) => (
        <span className="text-text-secondary text-xs flex items-center gap-1">
          <Phone size={12} className="text-text-muted" /> {c.phone}
        </span>
      ),
    },
    {
      key: 'city',
      label: 'Location',
      sortable: true,
      render: (c: Customer) => (
        <span className="text-text-secondary text-sm">
          {c.city}, {c.country}
        </span>
      ),
    },
    {
      key: 'totalOrders',
      label: 'Orders',
      sortable: true,
      render: (c: Customer) => <span className="font-semibold text-text-primary">{c.totalOrders}</span>,
    },
    {
      key: 'totalSpent',
      label: 'Total Spent',
      sortable: true,
      render: (c: Customer) => (
        <span className="font-bold text-text-primary">{formatCurrency(c.totalSpent)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (c: Customer) => <StatusBadge status={c.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Customers Management</h1>
          {/* <p className="text-sm text-text-muted">View customer profiles, lifetime spending, and order history</p> */}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
        <DataTable<Customer>
          data={customers}
          columns={columns}
          searchKeys={['name', 'email', 'phone', 'city']}
          searchPlaceholder="Search customers by name, email, city..."
          itemsPerPage={8}
          selectable={true}
          selectedIds={selectedCustomerIds}
          onSelectChange={setSelectedCustomerIds}
          bulkActions={
            <button
              type="button"
              onClick={() => setConfirmBulkDelete(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-danger text-white text-[14px] font-medium hover:bg-danger/90 transition cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedCustomerIds.length})</span>
            </button>
          }
          actions={(customer) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => navigate(`/customers/${customer.id}`)}
                title="View Customer Profile"
                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-primary transition"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(customer)}
                title="Delete Customer"
                className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCustomer(deleteTarget.id);
            setSelectedCustomerIds((prev) => prev.filter((id) => id !== deleteTarget.id));
            setDeleteTarget(null);
          }
        }}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? All associated profile data will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={() => {
          deleteCustomers(selectedCustomerIds);
          setSelectedCustomerIds([]);
          setConfirmBulkDelete(false);
        }}
        title="Delete Selected Customers"
        message={`Are you sure you want to delete ${selectedCustomerIds.length} selected customer(s)? All associated profile data will be permanently removed.`}
        confirmLabel={`Delete (${selectedCustomerIds.length})`}
        variant="danger"
      />
    </div>
  );
}
