import React, { useState } from 'react';
import { Edit2, Plus, Trash2, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { STORE_ASSETS } from '../../data/mockData';
import { Category } from '../../types';
import { SafeImage } from '../../components/SafeImage';
import { ConfirmModal } from '../../components/ConfirmModal';

const CATEGORY_ARTWORKS = [
  { label: 'Ninja Figure', url: STORE_ASSETS.ninjaFigure },
  { label: 'Manga Collection', url: STORE_ASSETS.mangaCollection },
  { label: 'Forest Spirit Plush', url: STORE_ASSETS.forestPlush },
  { label: 'Accessories & Keychains', url: STORE_ASSETS.accessoriesPack },
  { label: 'Pagoda Wall Scroll', url: STORE_ASSETS.wallScroll },
  { label: 'Crimson Cloud Haori', url: STORE_ASSETS.cloudHaori },
  { label: 'Warrior Figure', url: STORE_ASSETS.warriorFigure },
];

export const AdminCategoriesPage: React.FC = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(STORE_ASSETS.ninjaFigure);
  const [accentBg, setAccentBg] = useState('#F9E5CD');

  const openCreate = () => {
    setEditing(null);
    setName('');
    setShortName('');
    setDescription('');
    setImage(STORE_ASSETS.ninjaFigure);
    setAccentBg('#F9E5CD');
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setShortName(cat.shortName);
    setDescription(cat.description);
    setImage(cat.image);
    setAccentBg(cat.accentBg || '#F9E5CD');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      shortName: shortName.trim() || name.trim().split(' ')[0],
      description: description.trim() || 'Curated anime collection items.',
      image,
      iconKey: name.toLowerCase(),
      accentBg,
    };
    if (editing) {
      updateCategory(editing.id, payload);
    } else {
      addCategory(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
            Categories Management
          </h2>
          <p className="mt-1 text-sm text-[#724A3E]">
            Organize storefront collections displayed on the homepage and shop sidebar.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {categories.map((cat) => {
          const itemCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4 flex flex-col shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div
                  className="w-16 h-16 rounded-xl p-1.5 shrink-0 border border-[#EED9C2]"
                  style={{ backgroundColor: cat.accentBg || '#F9E5CD' }}
                >
                  <SafeImage
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-bold text-[#3D160F] truncate">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#8E6453] tabular-nums">{itemCount} products</p>
                </div>
              </div>

              <p className="mt-3 text-xs text-[#6B4235] leading-relaxed flex-1">
                {cat.description}
              </p>

              <div className="mt-4 pt-3 border-t border-[#F4E9DC] flex items-center justify-between">
                <span className="font-mono text-[11px] text-[#8E6453]">/{cat.slug}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                    className="p-1.5 rounded-lg text-[#5E3224] hover:bg-[#F7DCC3]/60 hover:text-[#D96532] cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(cat)}
                    aria-label={`Delete ${cat.name}`}
                    className="p-1.5 rounded-lg text-[#5E3224] hover:bg-[#C62828]/10 hover:text-[#C62828] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D160F]/45 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#FFFDF9] border border-[#EAD7C3] p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE0CE]">
              <h3 className="font-display text-xl font-bold text-[#3D160F]">
                {editing ? 'Edit Category' : 'New Category'}
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
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Cosplay Props"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Short Label (Mobile)
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="e.g., Cosplay"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                  Category Artwork
                </label>
                <select
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                >
                  {CATEGORY_ARTWORKS.map((art) => (
                    <option key={art.url} value={art.url}>
                      {art.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                />
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
                  {editing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? Existing products in this category will remain in the catalog.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
