import React, { useMemo, useState } from 'react';
import { Award, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Customer } from '../../types';
import { formatDate, formatPrice } from '../../utils/format';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminCustomersPage: React.FC = () => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, deleteCustomers } = useStore();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Phnom Penh');
  const [role, setRole] = useState<'customer' | 'admin'>('customer');
  const [clubMember, setClubMember] = useState(true);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const isAllSelected =
    filtered.length > 0 && filtered.every((c) => selectedIds.includes(c.id));
  const isPartiallySelected =
    filtered.some((c) => selectedIds.includes(c.id)) && !isAllSelected;

  const handleToggleSelectAll = () => {
    const filteredIds = filtered.map((c) => c.id);
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

  const openCreate = () => {
    setEditing(null);
    setName('');
    setEmail('');
    setPhone('+855 12 ');
    setAddress('');
    setCity('Phnom Penh');
    setRole('customer');
    setClubMember(true);
    setModalOpen(true);
  };

  const openEdit = (cust: Customer) => {
    setEditing(cust);
    setName(cust.name);
    setEmail(cust.email);
    setPhone(cust.phone);
    setAddress(cust.address);
    setCity(cust.city);
    setRole(cust.role);
    setClubMember(cust.clubMember);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Phnom Penh',
      city: city.trim() || 'Phnom Penh',
      role,
      clubMember,
    };
    if (editing) {
      updateCustomer(editing.id, payload);
    } else {
      addCustomer(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
            Customers Management
          </h2>
          <p className="mt-1 text-sm text-[#724A3E] tabular-nums">
            {customers.length} collector profiles and Anime Club memberships
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer by name, email, or city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#D96532]/10 border border-[#D96532]/25 text-xs">
            <span className="font-semibold text-[#3D160F] tabular-nums">
              {selectedIds.length} selected
            </span>
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
        )}
      </div>

      <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF0E4] border-b border-[#EFE0CE] text-xs text-[#6B4235]">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    aria-label="Select all customers"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isPartiallySelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded border-[#DFC7AE] accent-[#D96532] cursor-pointer align-middle"
                  />
                </th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Membership</th>
                <th className="py-3 px-4 font-semibold">Orders</th>
                <th className="py-3 px-4 font-semibold">Total Spent</th>
                <th className="py-3 px-4 font-semibold">Joined</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4E9DC]">
              {filtered.map((cust) => {
                const isSelected = selectedIds.includes(cust.id);
                return (
                <tr key={cust.id} className={isSelected ? 'bg-[#D96532]/5 hover:bg-[#D96532]/10' : 'hover:bg-[#FFF8EF]/70'}>
                  <td className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      aria-label={`Select ${cust.name}`}
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(cust.id)}
                      className="w-4 h-4 rounded border-[#DFC7AE] accent-[#D96532] cursor-pointer align-middle"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#3D160F]">{cust.name}</p>
                    <p className="text-xs text-[#8E6453]">{cust.email}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#5E3527]">
                    <p>{cust.city}</p>
                    <p className="text-[#8E6453]">{cust.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-xs font-semibold">
                    {cust.clubMember ? (
                      <span className="inline-flex items-center gap-1 text-[#C85322]">
                        <Award className="w-3.5 h-3.5" /> Anime Club
                      </span>
                    ) : (
                      <span className="text-[#8E6453]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4 tabular-nums font-semibold text-[#3D160F]">
                    {cust.ordersCount}
                  </td>
                  <td className="py-3 px-4 tabular-nums font-bold text-[#C94825]">
                    {formatPrice(cust.totalSpent)}
                  </td>
                  <td className="py-3 px-4 text-xs text-[#6B4235] whitespace-nowrap">
                    {formatDate(cust.joinedAt)}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(cust)}
                        aria-label={`Edit ${cust.name}`}
                        className="p-2 rounded-lg text-[#5E3224] hover:bg-[#F7DCC3]/60 hover:text-[#D96532] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(cust)}
                        aria-label={`Delete ${cust.name}`}
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
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D160F]/45 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFDF9] border border-[#EAD7C3] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE0CE]">
              <h3 className="font-display text-xl font-bold text-[#3D160F]">
                {editing ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#7E5546] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-[#3D160F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={clubMember}
                    onChange={(e) => setClubMember(e.target.checked)}
                    className="accent-[#D96532]"
                  />
                  <span>Anime Club Member</span>
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'customer' | 'admin')}
                  className="px-3 py-1.5 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-xs font-semibold"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFC5AA] text-sm font-semibold text-[#5E3224] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold cursor-pointer"
                >
                  {editing ? 'Save Changes' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Customer"
        message={`Remove ${deleteTarget?.name} from the customer directory?`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCustomer(deleteTarget.id);
            setSelectedIds((prev) => prev.filter((id) => id !== deleteTarget.id));
          }
          setDeleteTarget(null);
        }}
      />

      <ConfirmModal
        open={bulkDeleteOpen}
        title="Delete Selected Customers"
        message={`Remove ${selectedIds.length} selected customer(s) from the customer directory? This action cannot be undone.`}
        confirmLabel={`Delete (${selectedIds.length})`}
        destructive
        onCancel={() => setBulkDeleteOpen(false)}
        onConfirm={() => {
          deleteCustomers(selectedIds);
          setSelectedIds([]);
          setBulkDeleteOpen(false);
        }}
      />
    </div>
  );
};
