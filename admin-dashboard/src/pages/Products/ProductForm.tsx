import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import Button from '@/components/common/Button';
import ImageUpload from '@/components/common/ImageUpload';
import { generateSku } from '@/utils/formatters';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, categories, addProduct, updateProduct } = useApp();

  const isEdit = Boolean(id);
  const existingProduct = isEdit ? products.find((p) => p.id === id) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('10');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setPrice(existingProduct.price.toString());
      setCompareAtPrice(existingProduct.compareAtPrice ? existingProduct.compareAtPrice.toString() : '');
      setCategoryId(existingProduct.categoryId || categories[0]?.id || '');
      setSku(existingProduct.sku);
      setStock(existingProduct.stock.toString());
      setStatus(existingProduct.status);
      setImages(existingProduct.images || []);
      setTags(existingProduct.tags?.join(', ') || '');
    } else if (categories.length > 0) {
      setCategoryId(categories[0].id);
      setSku(generateSku(categories[0].name));
    }
  }, [existingProduct, categories]);

  const handleCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    if (!isEdit) {
      const selectedCat = categories.find((c) => c.id === newCatId);
      if (selectedCat) setSku(generateSku(selectedCat.name));
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Product name is required';
    if (!description.trim()) errs.description = 'Description is required';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errs.price = 'Valid price is required';
    if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) errs.stock = 'Valid stock is required';
    if (!sku.trim()) errs.sku = 'SKU is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedCategory = categories.find((c) => c.id === categoryId);
    const categoryName = selectedCategory ? selectedCategory.name : 'Uncategorized';

    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
      category: categoryName,
      categoryId,
      sku: sku.trim(),
      stock: parseInt(stock, 10),
      status,
      images,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (isEdit && id) {
      updateProduct(id, payload);
    } else {
      addProduct(payload);
    }
    navigate('/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/products"
            className="p-2 rounded-xl bg-white border border-border-light hover:bg-secondary/40 text-text-secondary transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-[24px] font-semibold text-text-primary">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-sm text-text-muted">
              {isEdit ? 'Update product information and catalog details' : 'Fill in the information to add to the store'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
              <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3">
                General Information
              </h3>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">
                  Product Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Goku Super Saiyan Figure"
                  className={`w-full px-4 py-2.5 text-base sm:text-sm bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.name ? 'border-danger' : 'border-border focus:border-primary'
                  }`}
                />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product description..."
                  className={`w-full px-4 py-2.5 text-base sm:text-sm bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                    errors.description ? 'border-danger' : 'border-border focus:border-primary'
                  }`}
                />
                {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
              </div>

              {/* Media Upload */}
              <div className="pt-2">
                <ImageUpload images={images} onChange={setImages} />
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
              <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3">
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-base font-semibold text-text-primary mb-1.5">
                    Price ($) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                    className={`w-full px-4 py-2.5 text-base sm:text-sm bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.price ? 'border-danger' : 'border-border focus:border-primary'
                    }`}
                  />
                  {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-text-primary mb-1.5">
                    Compare At Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="39.99 (Optional discount)"
                    className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-text-primary mb-1.5">
                    SKU <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="FIG-001"
                    className={`w-full px-4 py-2.5 text-base sm:text-sm bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.sku ? 'border-danger' : 'border-border focus:border-primary'
                    }`}
                  />
                  {errors.sku && <p className="text-xs text-danger mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-base font-semibold text-text-primary mb-1.5">
                    Stock Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="10"
                    className={`w-full px-4 py-2.5 text-base sm:text-sm bg-white border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.stock ? 'border-danger' : 'border-border focus:border-primary'
                    }`}
                  />
                  {errors.stock && <p className="text-xs text-danger mt-1">{errors.stock}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
              <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3">
                Organization
              </h3>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'archived')}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="active">Active (Published)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-text-primary mb-1.5">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="anime, figure, limited"
                  className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button type="submit" icon={<Save size={16} />} className="flex-1">
                {isEdit ? 'Save Changes' : 'Create Product'}
              </Button>
              <Link to="/products">
                <Button variant="ghost">Cancel</Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
