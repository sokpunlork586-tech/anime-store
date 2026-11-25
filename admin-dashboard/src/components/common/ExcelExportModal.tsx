import { useState } from 'react';
import { Download, CheckSquare, Square, FileSpreadsheet } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import type { ExportColumn } from '@/utils/excelService';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  defaultFileName: string;
  columns: ExportColumn[];
  totalCount: number;
  filteredCount: number;
  selectedCount?: number;
  onExport: (options: {
    exportMode: 'all' | 'filtered' | 'selected';
    selectedColumns: string[];
    fileName: string;
  }) => void;
}

export default function ExcelExportModal({
  isOpen,
  onClose,
  title = 'Export to Excel (.xlsx)',
  defaultFileName,
  columns,
  totalCount,
  filteredCount,
  selectedCount = 0,
  onExport,
}: ExcelExportModalProps) {
  const [exportMode, setExportMode] = useState<'all' | 'filtered' | 'selected'>(
    selectedCount > 0 ? 'selected' : 'all'
  );
  const [selectedColKeys, setSelectedColKeys] = useState<string[]>(
    columns.map((c) => c.key)
  );
  const [fileName, setFileName] = useState(defaultFileName);

  const toggleColumn = (key: string) => {
    setSelectedColKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSelectAll = (select: boolean) => {
    setSelectedColKeys(select ? columns.map((c) => c.key) : []);
  };

  const handleConfirm = () => {
    onExport({
      exportMode,
      selectedColumns: selectedColKeys,
      fileName: fileName.trim() || defaultFileName,
    });
    onClose();
  };

  const getRecordCount = () => {
    if (exportMode === 'selected') return selectedCount;
    if (exportMode === 'filtered') return filteredCount;
    return totalCount;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📤 ${title}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            icon={<Download size={16} />}
            disabled={selectedColKeys.length === 0 || getRecordCount() === 0}
          >
            Download Excel ({getRecordCount()} rows)
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Export Scope Selector */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            1. Select Export Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setExportMode('all')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                exportMode === 'all'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border-light hover:bg-secondary/20'
              }`}
            >
              <p className="text-xs font-bold text-text-primary">All Records</p>
              <p className="text-xs text-text-muted mt-0.5">{totalCount} total</p>
            </button>

            <button
              type="button"
              onClick={() => setExportMode('filtered')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                exportMode === 'filtered'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border-light hover:bg-secondary/20'
              }`}
            >
              <p className="text-xs font-bold text-text-primary">Filtered / Searched</p>
              <p className="text-xs text-text-muted mt-0.5">{filteredCount} matches</p>
            </button>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={() => setExportMode('selected')}
              className={`p-3 rounded-xl border text-left transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                exportMode === 'selected'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border-light hover:bg-secondary/20'
              }`}
            >
              <p className="text-xs font-bold text-text-primary">Selected Rows</p>
              <p className="text-xs text-text-muted mt-0.5">{selectedCount} chosen</p>
            </button>
          </div>
        </div>

        {/* Column Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
              2. Select Columns ({selectedColKeys.length}/{columns.length})
            </label>
            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectAll(true)}
                className="text-primary hover:underline font-semibold cursor-pointer"
              >
                Select All
              </button>
              <span className="text-border">|</span>
              <button
                type="button"
                onClick={() => handleSelectAll(false)}
                className="text-text-muted hover:text-text-primary cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto p-3 rounded-xl border border-border-light bg-background/50 grid grid-cols-2 gap-2">
            {columns.map((col) => {
              const isChecked = selectedColKeys.includes(col.key);
              return (
                <label
                  key={col.key}
                  className="flex items-center gap-2 text-xs font-medium text-text-primary cursor-pointer select-none hover:text-primary transition"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleColumn(col.key)}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  />
                  <span>{col.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* File Name */}
        <div>
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            3. File Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="export.xlsx"
              className="w-full px-3.5 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono text-text-primary"
            />
            <FileSpreadsheet
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-success pointer-events-none"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
