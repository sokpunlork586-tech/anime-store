import React, { useMemo, useState } from 'react';
import { Edit2, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { Product, ProductBadge } from '../../types';
import { formatPrice } from '../../utils/format';
import { SafeImage } from '../../components/SafeImage';
import { ConfirmModal } from '../../components/ConfirmModal';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useStore();

  const presetImages = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ label: string; url: string }> = [];
    for (const p of products) {
      if (p.image && !seen.has(p.image)) {
        seen.add(p.image);
        list.push({ label: p.name, url: p.image });
      }
    }
    return list;
  }, [products]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [series, setSeries] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState('29.99');
  const [originalPrice, setOriginalPrice] = useState('39.99');
  const [stock, setStock] = useState('20');
  const [rating, setRating] = useState('4.8');
  const [badge, setBadge] = useState<string>('');
  const [image, setImage] = useState('');
  const [featured, setFeatured] = useState(true);
  const [isNewArrival, setIsNewArrival] = useState(true);
  const [description, setDescription] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'all' && p.categoryId !== categoryFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    });
  }, [products, search, categoryFilter]);

  const openCreateModal = () => {
    setEditing(null);
    setName('');
    setSku(`AS-NEW-${Math.floor(100 + Math.random() * 900)}`);
    setSeries('Naruto Shippuden');
    setCategoryId(categories[0]?.id || '');
    setPrice('29.99');
    setOriginalPrice('36.99');
    setStock('25');
    setRating('4.8');
    setBadge('New Arrival');
    setImage(presetImages[0]?.url || '');
    setFeatured(true);
    setIsNewArrival(true);
    setDescription('Officially licensed anime collectible crafted with collector-grade finish.');
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditing(product);
    setName(product.name);
    setSku(product.sku);
    setSeries(product.series);
    setCategoryId(product.categoryId);
    setPrice(String(product.price));
    setOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setStock(String(product.stock));
    setRating(String(product.rating));
    setBadge(product.badge || '');
    setImage(product.image);
    setFeatured(product.featured);
    setIsNewArrival(product.isNewArrival);
    setDescription(product.description);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const cat = categories.find((c) => c.id === categoryId);
    const parsedPrice = Math.max(0.99, Number(price) || 19.99);
    const parsedOriginal = originalPrice ? Number(originalPrice) : undefined;
    const payload = {
      sku: sku.trim() || `AS-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      series: series.trim() || 'Anime Original',
      categoryId,
      categoryName: cat?.name || 'Anime Figures',
      price: parsedPrice,
      originalPrice: parsedOriginal && parsedOriginal > parsedPrice ? parsedOriginal : undefined,
      rating: Math.min(5, Math.max(1, Number(rating) || 4.8)),
      image: image || presetImages[0]?.url || '',
      gallery: image ? [image] : [],
      badge: (badge || null) as ProductBadge,
      featured,
      isNewArrival,
      stock: Math.max(0, Math.floor(Number(stock) || 0)),
      description: description.trim() || 'Authentic anime collector merchandise.',
      specifications: editing?.specifications || {
        Condition: 'Brand New Factory Sealed',
        Packaging: 'Collector Display Box',
      },
      variants: editing?.variants || ['Standard Edition'],
    };

    if (editing) {
      updateProduct(editing.id, payload);
    } else {
      addProduct(payload);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
            Products Management
          </h2>
          <p className="mt-1 text-sm text-[#724A3E] tabular-nums">
            {products.length} products in store catalog
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, series, or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-[#FFFDF9] border border-[#E7D2BC] text-sm font-medium text-[#3D160F] focus:outline-none focus:border-[#D96532]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF0E4] border-b border-[#EFE0CE] text-xs text-[#6B4235]">
              <tr>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold">Stock</th>
                <th className="py-3 px-4 font-semibold">Rating</th>
                <th className="py-3 px-4 font-semibold">Featured</th>
                <th className="py-3 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4E9DC]">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-[#FFF8EF]/70">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        className="w-11 h-11 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#3D160F] truncate max-w-[220px]">
                          {product.name}
                        </p>
                        <p className="text-xs text-[#8E6453]">
                          {product.series} · <span className="font-mono">{product.sku}</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#5E3527] whitespace-nowrap">
                    {product.categoryName}
                  </td>
                  <td className="py-3 px-4 tabular-nums whitespace-nowrap">
                    <span className="font-bold text-[#C94825]">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="ml-1.5 text-xs text-[#A38477] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 tabular-nums">
                    <span
                      className={`text-xs font-bold ${
                        product.stock === 0
                          ? 'text-[#C62828]'
                          : product.stock <= 10
                            ? 'text-[#C85322]'
                            : 'text-[#2E7D32]'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-xs font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-[#F5A623] text-[#F5A623]" />
                      {product.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => updateProduct(product.id, { featured: !product.featured })}
                      className={`text-xs font-semibold cursor-pointer ${
                        product.featured ? 'text-[#2E7D32]' : 'text-[#9B7A6B]'
                      }`}
                    >
                      {product.featured ? 'Featured' : 'Standard'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        aria-label={`Edit ${product.name}`}
                        className="p-2 rounded-lg text-[#5E3224] hover:bg-[#F7DCC3]/60 hover:text-[#D96532] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Delete ${product.name}`}
                        className="p-2 rounded-lg text-[#5E3224] hover:bg-[#C62828]/10 hover:text-[#C62828] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D160F]/45 backdrop-blur-[2px] p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FFFDF9] border border-[#EAD7C3] p-6 sm:p-7 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#EFE0CE]">
              <h3 className="font-display text-2xl font-bold text-[#3D160F]">
                {editing ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-[#7E5546] hover:bg-[#F7DCC3]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Tanjiro Figure"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Anime Series *
                  </label>
                  <input
                    type="text"
                    required
                    value={series}
                    onChange={(e) => setSeries(e.target.value)}
                    placeholder="e.g., Demon Slayer"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm font-mono focus:outline-none focus:border-[#D96532]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">Badge</label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
                  >
                    <option value="">None</option>
                    <option value="Best Seller">Best Seller</option>
                    <option value="New Arrival">New Arrival</option>
                    <option value="Hot">Hot</option>
                    <option value="Limited">Limited</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.99"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                    Original ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3224] mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3224] mb-1">
                  Product Artwork
                </label>
                <select
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FFF8EF] border border-[#E7D2BC] text-sm"
                >
                  {presetImages.map((img) => (
                    <option key={img.url} value={img.url}>
                      {img.label}
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

              <div className="flex flex-wrap gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm text-[#3D160F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="accent-[#D96532]"
                  />
                  <span>Show in Featured Products</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#3D160F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="accent-[#D96532]"
                  />
                  <span>Mark as New Arrival</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#EFE0CE] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFC5AA] text-sm font-semibold text-[#5E3224] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-[#D96532] hover:bg-[#BF5223] text-white text-sm font-semibold cursor-pointer"
                >
                  {editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteTarget?.name}" from the catalog? This also removes it from active carts and wishlists.`}
        confirmLabel="Delete"
        destructive
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteProduct(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
};
