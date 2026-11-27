import { useState } from 'react';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { formatDate } from '@/utils/formatters';
import type { Category } from '@/types';

export default function CategoryList() {
  const { categories, addCategory, updateCategory, deleteCategory } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState('');

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setStatus('active');
    setError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setStatus(cat.status);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingCategory) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        slug,
        description: description.trim(),
        status,
      });
    } else {
      addCategory({
        name: name.trim(),
        slug,
        description: description.trim(),
        image: '',
        status,
      });
    }
    setModalOpen(false);
  };

  const columns = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (c: Category) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/60 flex items-center justify-center text-primary font-bold">
            <FolderOpen size={20} />
          </div>
          <div>
            <p className="font-semibold text-text-primary">{c.name}</p>
            <p className="text-xs text-text-muted">slug: /{c.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (c: Category) => (
        <p className="text-text-secondary text-sm max-w-sm truncate">{c.description}</p>
      ),
    },
    {
      key: 'productCount',
      label: 'Products',
      sortable: true,
      render: (c: Category) => <span className="font-semibold text-text-primary">{c.productCount} items</span>,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (c: Category) => <StatusBadge status={c.status} />,
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (c: Category) => <span className="text-text-muted text-xs">{formatDate(c.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Categories Management</h1>
          {/* <p className="text-sm text-text-muted">Organize your store products into customer-friendly categories</p> */}
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus size={16} />}>
          Add Category
        </Button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
        <DataTable<Category>
          data={categories}
          columns={columns}
          searchKeys={['name', 'description']}
          searchPlaceholder="Search categories..."
          itemsPerPage={8}
          actions={(category) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => handleOpenEdit(category)}
                title="Edit Category"
                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-primary transition"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(category)}
                title="Delete Category"
                className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      </div>

      {/* Add / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">
              Category Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Figures & Statues"
              className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {error && <p className="text-xs text-danger mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this collection..."
              className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteCategory(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Products inside may become uncategorized.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
