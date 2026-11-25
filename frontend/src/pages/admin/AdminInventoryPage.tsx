import React, { useMemo, useState } from 'react';
import { Minus, Plus, Search } from 'lucide-react';
import { useStore } from '../../contexts/StoreContext';
import { SafeImage } from '../../components/SafeImage';

export const AdminInventoryPage: React.FC = () => {
  const { products, updateStock, showToast } = useStore();
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (filter === 'low' && (p.stock === 0 || p.stock > 10)) return false;
      if (filter === 'out' && p.stock > 0) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q)
      );
    });
  }, [products, filter, search]);

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const adjustStock = (id: string, name: string, nextVal: number) => {
    const clamped = Math.max(0, nextVal);
    updateStock(id, clamped);
    showToast('Inventory updated', `${name} stock set to ${clamped} units.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#3D160F]">
          Inventory Management
        </h2>
        <p className="mt-1 text-sm text-[#724A3E]">
          Monitor real-time stock quantities and quickly restock figures and manga sets.
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4">
          <p className="text-xs text-[#7E5546]">Total Units On Hand</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#3D160F] tabular-nums">
            {totalUnits}
          </p>
        </div>
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4">
          <p className="text-xs text-[#7E5546]">Low Stock (1–10)</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#C85322] tabular-nums">
            {lowCount}
          </p>
        </div>
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] p-4">
          <p className="text-xs text-[#7E5546]">Out of Stock</p>
          <p className="mt-1 font-display text-2xl font-bold text-[#C62828] tabular-nums">
            {outCount}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#F7E5CE]/70 border border-[#EAD3B8] self-start">
          {[
            { id: 'all', label: 'All Stock' },
            { id: 'low', label: `Low Stock (${lowCount})` },
            { id: 'out', label: `Out of Stock (${outCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === tab.id ? 'bg-[#D96532] text-white' : 'text-[#5A3224]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#8E6453] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter SKU or item..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#FFFDF9] border border-[#E7D2BC] text-sm focus:outline-none focus:border-[#D96532]"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFE0CE] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF0E4] border-b border-[#EFE0CE] text-xs text-[#6B4235]">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Product</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Units in Stock</th>
                <th className="py-3 px-4 text-right font-semibold">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4E9DC]">
              {filtered.map((product) => {
                const statusLabel =
                  product.stock === 0
                    ? 'Out of Stock'
                    : product.stock <= 10
                      ? 'Low Stock'
                      : 'Healthy';
                const statusColor =
                  product.stock === 0
                    ? 'text-[#C62828]'
                    : product.stock <= 10
                      ? 'text-[#C85322]'
                      : 'text-[#2E7D32]';

                return (
                  <tr key={product.id} className="hover:bg-[#FFF8EF]/70">
                    <td className="py-3 px-4 font-mono text-xs text-[#7E5546]">{product.sku}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <SafeImage
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover bg-[#FBF3E8] shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-[#3D160F]">{product.name}</p>
                          <p className="text-xs text-[#8E6453]">{product.categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`py-3 px-4 text-xs font-bold ${statusColor}`}>{statusLabel}</td>
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center rounded-xl border border-[#E7D2BC] bg-[#FFF8EF]">
                        <button
                          type="button"
                          onClick={() => adjustStock(product.id, product.name, product.stock - 1)}
                          aria-label={`Decrease stock for ${product.name}`}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F7DCC3]/60 rounded-l-xl cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={product.stock}
                          onChange={(e) =>
                            updateStock(product.id, Math.max(0, Number(e.target.value) || 0))
                          }
                          aria-label={`Stock quantity for ${product.name}`}
                          className="w-14 text-center text-sm font-bold bg-transparent tabular-nums focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => adjustStock(product.id, product.name, product.stock + 1)}
                          aria-label={`Increase stock for ${product.name}`}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F7DCC3]/60 rounded-r-xl cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => adjustStock(product.id, product.name, product.stock + 10)}
                        className="px-3 py-1.5 rounded-lg bg-[#F7E5CE] hover:bg-[#D96532] hover:text-white text-xs font-semibold text-[#3D160F] transition-colors cursor-pointer"
                      >
                        +10 Units
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-[#7E5546]">
                    No inventory items in this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
