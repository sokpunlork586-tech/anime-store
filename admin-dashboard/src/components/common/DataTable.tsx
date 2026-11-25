import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import EmptyState from './EmptyState';
import type { SortConfig } from '@/types';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  itemsPerPage?: number;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectChange?: (selectedIds: string[]) => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  headerActions?: React.ReactNode;
  filterSlot?: React.ReactNode;
  bulkActions?: React.ReactNode;
}

export default function DataTable<T extends { id: string }>({
  data, columns, searchable = true, searchPlaceholder = 'Search...',
  searchKeys = [], itemsPerPage = 10, selectable = false, selectedIds = [],
  onSelectChange, onView, onEdit, onDelete,
  actions, emptyTitle = 'No data found', emptyDescription = 'No items match your search criteria.',
  headerActions, filterSlot, bulkActions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortConfig | null>(null);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...data];
    if (search && searchKeys.length > 0) {
      const q = search.toLowerCase();
      result = result.filter(item =>
        searchKeys.some(key => {
          const val = (item as Record<string, unknown>)[key];
          return typeof val === 'string' && val.toLowerCase().includes(q);
        })
      );
    }
    if (sort) {
      result.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sort.key];
        const bVal = (b as Record<string, unknown>)[sort.key];
        const cmp = typeof aVal === 'number' && typeof bVal === 'number'
          ? aVal - bVal
          : String(aVal).localeCompare(String(bVal));
        return sort.direction === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [data, search, sort, searchKeys]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paged = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSort = (key: string) => {
    setSort(prev =>
      prev?.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  };

  const handleToggleSelectAll = () => {
    if (!onSelectChange) return;
    const allFilteredIds = filtered.map(item => item.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.includes(id));
    if (areAllSelected) {
      onSelectChange(selectedIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      const combined = Array.from(new Set([...selectedIds, ...allFilteredIds]));
      onSelectChange(combined);
    }
  };

  const handleToggleRow = (id: string) => {
    if (!onSelectChange) return;
    if (selectedIds.includes(id)) {
      onSelectChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectChange([...selectedIds, id]);
    }
  };

  const isAllSelected = filtered.length > 0 && filtered.every(item => selectedIds.includes(item.id));
  const isPartiallySelected = filtered.some(item => selectedIds.includes(item.id)) && !isAllSelected;

  const hasActions = onView || onEdit || onDelete || actions;

  return (
    <div>
      {(searchable || headerActions || filterSlot) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          {searchable && <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={searchPlaceholder} className="w-full sm:w-72" />}
          {filterSlot}
          {headerActions && <div className="ml-auto flex items-center gap-2">{headerActions}</div>}
        </div>
      )}

      {selectable && selectedIds.length > 0 && (
        <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl mb-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary">{selectedIds.length}</span>
            <span className="text-text-primary">item(s) selected</span>
          </div>
          <div className="flex items-center gap-3">
            {bulkActions}
            <button
              type="button"
              onClick={() => onSelectChange && onSelectChange([])}
              className="text-primary hover:underline text-[14px] font-medium cursor-pointer"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border-light">
            <table className="w-full text-[14px] font-normal">
              <thead>
                <tr className="bg-secondary/30">
                  {selectable && (
                    <th className="px-4 py-3 text-left w-10">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = isPartiallySelected;
                        }}
                        onChange={handleToggleSelectAll}
                        className="rounded border-border text-primary focus:ring-primary cursor-pointer w-4 h-4"
                        title="Select/Deselect all visible rows"
                      />
                    </th>
                  )}
                  {columns.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable && handleSort(col.key)}
                      className={`px-4 py-3 text-left text-[14px] font-medium text-text-secondary whitespace-nowrap
                        ${col.sortable ? 'cursor-pointer hover:text-text-primary select-none' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sort?.key === col.key && (
                          sort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        )}
                      </div>
                    </th>
                  ))}
                  {hasActions && <th className="px-4 py-3 text-right text-[14px] font-medium text-text-secondary">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light text-[14px] font-normal">
                {paged.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-secondary/10'
                      }`}
                    >
                      {selectable && (
                        <td className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleRow(item.id)}
                            className="rounded border-border text-primary focus:ring-primary cursor-pointer w-4 h-4"
                          />
                        </td>
                      )}
                      {columns.map(col => (
                        <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                          {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? '')}
                        </td>
                      ))}
                      {hasActions && (
                        <td className="px-4 py-3 text-right">
                          {actions ? actions(item) : (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted cursor-pointer"
                              >
                                <MoreVertical size={16} />
                              </button>
                              {openMenuId === item.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                  <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-border-light py-1 min-w-[140px]">
                                    {onView && (
                                      <button onClick={() => { onView(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/40 text-text-secondary cursor-pointer">
                                        <Eye size={14} /> View
                                      </button>
                                    )}
                                    {onEdit && (
                                      <button onClick={() => { onEdit(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/40 text-text-secondary cursor-pointer">
                                        <Edit size={14} /> Edit
                                      </button>
                                    )}
                                    {onDelete && (
                                      <button onClick={() => { onDelete(item); setOpenMenuId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary/40 text-danger cursor-pointer">
                                        <Trash2 size={14} /> Delete
                                      </button>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} />
        </>
      )}
    </div>
  );
}
