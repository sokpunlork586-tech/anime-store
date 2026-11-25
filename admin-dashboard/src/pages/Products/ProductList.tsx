import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ExcelExportModal from '@/components/common/ExcelExportModal';
import ExcelImportModal from '@/components/common/ExcelImportModal';
import {
  exportProductsToExcel,
  downloadProductsTemplate,
  validateProductsImport,
  productExportColumns,
} from '@/utils/excelService';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { Product } from '@/types';

export default function ProductList() {
  const navigate = useNavigate();
  const { products, categories, deleteProduct, importProducts, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;
    return matchCat && matchStatus;
  });

  const columns = [
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (p: Product) => (
        <div className="flex items-center gap-3">
          {p.images?.[0] ? (
            <img
              src={p.images[0]}
              alt={p.name}
              className="w-10 h-10 rounded-lg object-cover border border-border-light bg-secondary/40 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-secondary/60 flex items-center justify-center font-bold text-primary flex-shrink-0">
              📦
            </div>
          )}
          <div>
            <p className="font-semibold text-text-primary">{p.name}</p>
            <p className="text-xs text-text-muted">SKU: {p.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (p: Product) => <span className="text-text-secondary">{p.category}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (p: Product) => (
        <div>
          <span className="font-semibold text-text-primary">{formatCurrency(p.price)}</span>
          {p.compareAtPrice && (
            <span className="text-xs text-text-muted line-through ml-2">
              {formatCurrency(p.compareAtPrice)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (p: Product) => (
        <span
          className={`font-medium ${p.stock === 0 ? 'text-danger font-semibold' : p.stock <= 10 ? 'text-warning' : 'text-text-primary'
            }`}
        >
          {p.stock} units
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (p: Product) => <StatusBadge status={p.status} />,
    },
    {
      key: 'unitsSold',
      label: 'Units Sold',
      sortable: true,
      render: (p: Product) => <span className="text-text-secondary">{p.unitsSold}</span>,
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
    let rowsToExport: Product[] = [];
    if (exportMode === 'selected') {
      rowsToExport = products.filter((p) => selectedProductIds.includes(p.id));
    } else if (exportMode === 'filtered') {
      rowsToExport = filteredProducts;
    } else {
      rowsToExport = products;
    }

    if (rowsToExport.length === 0) {
      addToast('No products found to export', 'error');
      return;
    }

    exportProductsToExcel(rowsToExport, fileName, selectedColumns);
    addToast(`Exported ${rowsToExport.length} product(s) to ${fileName}`, 'success');
  };

  // Handler for Excel Import
  const handleImport = (validRows: Product[], duplicateHandling: 'update' | 'skip') => {
    importProducts(validRows, duplicateHandling);
    setSelectedProductIds([]);
  };

  // Import preview columns
  const importPreviewColumns = [
    { key: 'sku', label: 'SKU' },
    { key: 'name', label: 'Product Name' },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price ($)',
      render: (p: Product) => formatCurrency(p.price),
    },
    { key: 'stock', label: 'Stock' },
    {
      key: 'status',
      label: 'Status',
      render: (p: Product) => <StatusBadge status={p.status} />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Products Management</h1>
          {/* <p className="text-sm text-text-muted">Manage catalog, pricing, inventory stock, and availability</p> */}
        </div>

        {/* Action Buttons: Export, Import & Add Product */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 bg-white hover:bg-primary/5 text-primary text-[14px] font-medium shadow-sm transition cursor-pointer"
          >
            <span className='text-lg'>📤</span>
            <span>Export Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-border-light bg-secondary/30 hover:bg-secondary/60 text-text-primary text-[14px] font-medium shadow-sm transition cursor-pointer"
          >
            <span className='text-lg'>📥</span>
            <span>Import Excel</span>
          </button>

          <Link to="/products/new">
            {/* <Button icon={<Plus size={16} />}>Add Product</Button> */}
            <Button><span className='text-lg'>➕</span><span> Add Product</span></Button>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
        <DataTable<Product>
          data={filteredProducts}
          columns={columns}
          searchKeys={['name', 'sku', 'category']}
          searchPlaceholder="Search products by name, SKU..."
          itemsPerPage={8}
          selectable={true}
          selectedIds={selectedProductIds}
          onSelectChange={setSelectedProductIds}
          filterSlot={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                <Filter size={14} className="text-text-muted" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          }
          actions={(product) => (
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setViewProduct(product)}
                title="View Details"
                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-text-primary transition"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => navigate(`/products/${product.id}/edit`)}
                title="Edit Product"
                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-primary transition"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => setDeleteTarget(product)}
                title="Delete Product"
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
            deleteProduct(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />

      {/* View Details Modal */}
      <Modal
        isOpen={Boolean(viewProduct)}
        onClose={() => setViewProduct(null)}
        title="Product Details"
        size="lg"
      >
        {viewProduct && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {viewProduct.images?.[0] ? (
                <img
                  src={viewProduct.images[0]}
                  alt={viewProduct.name}
                  className="w-20 h-20 rounded-xl object-cover border border-border-light bg-secondary/40 flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-secondary/50 flex items-center justify-center text-3xl font-bold text-primary flex-shrink-0">
                  📦
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-[18px] font-semibold text-text-primary">{viewProduct.name}</h3>
                <p className="text-sm text-text-muted mt-0.5">SKU: {viewProduct.sku} | Category: {viewProduct.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <StatusBadge status={viewProduct.status} />
                  <span className="text-sm font-bold text-primary">{formatCurrency(viewProduct.price)}</span>
                </div>
              </div>
            </div>

            {viewProduct.images && viewProduct.images.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {viewProduct.images.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    src={imgUrl}
                    alt={`${viewProduct.name} ${idx + 1}`}
                    className="w-14 h-14 rounded-lg object-cover border border-border-light"
                  />
                ))}
              </div>
            )}

            <div className="border-t border-border-light pt-4">
              <h4 className="text-sm font-semibold text-text-primary mb-1">Description</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{viewProduct.description}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-border-light pt-4">
              <div className="bg-background p-3 rounded-xl border border-border-light">
                <p className="text-xs text-text-muted">Stock</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{viewProduct.stock} units</p>
              </div>
              <div className="bg-background p-3 rounded-xl border border-border-light">
                <p className="text-xs text-text-muted">Units Sold</p>
                <p className="text-base font-bold text-text-primary mt-0.5">{viewProduct.unitsSold}</p>
              </div>
              <div className="bg-background p-3 rounded-xl border border-border-light">
                <p className="text-xs text-text-muted">Rating</p>
                <p className="text-base font-bold text-text-primary mt-0.5">⭐ {viewProduct.rating || 'N/A'}</p>
              </div>
              <div className="bg-background p-3 rounded-xl border border-border-light">
                <p className="text-xs text-text-muted">Created</p>
                <p className="text-sm font-semibold text-text-primary mt-0.5">{formatDate(viewProduct.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Export Modal */}
      <ExcelExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        title="Export Products to Excel"
        defaultFileName="products_export.xlsx"
        columns={productExportColumns}
        totalCount={products.length}
        filteredCount={filteredProducts.length}
        selectedCount={selectedProductIds.length}
        onExport={handleExport}
      />

      {/* Import Modal */}
      <ExcelImportModal<Product>
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        entityName="Products"
        title="Import Products from Excel"
        templateFileName="products_template.xlsx"
        onDownloadTemplate={downloadProductsTemplate}
        validateData={(rawRows) => validateProductsImport(rawRows, products, categories)}
        onConfirmImport={handleImport}
        previewColumns={importPreviewColumns}
      />
    </div>
  );
}
