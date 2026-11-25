import { useState, useRef, type ChangeEvent, type DragEvent } from 'react';
import {
  UploadCloud, FileSpreadsheet, Download, CheckCircle2,
  AlertTriangle, XCircle, ArrowRight, RefreshCw, Trash2, FileCheck
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { parseExcelFile, type ValidationResult, type ValidationError } from '@/utils/excelService';

interface PreviewColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface ExcelImportModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  entityName: string;
  templateFileName?: string;
  onDownloadTemplate: () => void;
  validateData: (rawRows: Record<string, any>[]) => ValidationResult<T>;
  onConfirmImport: (validRows: T[], duplicateHandling: 'update' | 'skip') => void;
  previewColumns: PreviewColumn<T>[];
}

export default function ExcelImportModal<T extends Record<string, any>>({
  isOpen,
  onClose,
  title,
  entityName,
  onDownloadTemplate,
  validateData,
  onConfirmImport,
  previewColumns,
}: ExcelImportModalProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult<T> | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'errors' | 'duplicates'>('preview');
  const [duplicateHandling, setDuplicateHandling] = useState<'update' | 'skip'>('update');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const resetState = () => {
    setFile(null);
    setFileError(null);
    setValidationResult(null);
    setActiveTab('preview');
    setDuplicateHandling('update');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const processFile = async (selectedFile: File) => {
    setFileError(null);
    setIsLoading(true);
    setValidationResult(null);

    try {
      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        throw new Error('Please upload an Excel spreadsheet file (.xlsx or .xls)');
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        throw new Error('File exceeds the maximum allowable size of 10MB.');
      }

      setFile(selectedFile);
      const rawRows = await parseExcelFile(selectedFile);

      if (rawRows.length === 0) {
        throw new Error('The uploaded Excel sheet contains no data rows.');
      }

      const result = validateData(rawRows);
      setValidationResult(result);

      if (result.validRows.length === 0 && result.errorRows.length > 0) {
        setActiveTab('errors');
      } else {
        setActiveTab('preview');
      }
    } catch (err: any) {
      setFileError(err.message || 'Failed to parse Excel file');
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleImport = () => {
    if (!validationResult || validationResult.validRows.length === 0) return;
    onConfirmImport(validationResult.validRows, duplicateHandling);
    handleClose();
  };

  const finalTitle = title || `Import ${entityName} from Excel`;

  // Calculated count for the confirm button
  const getActionableCount = () => {
    if (!validationResult) return 0;
    if (duplicateHandling === 'skip') {
      return validationResult.validRows.length - validationResult.duplicates.length;
    }
    return validationResult.validRows.length;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`📥 ${finalTitle}`}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3">
          <div className="text-xs text-text-muted">
            {validationResult && (
              <span>
                Ready to process: <strong className="text-text-primary">{getActionableCount()}</strong> record(s)
                {duplicateHandling === 'skip' && validationResult.duplicates.length > 0 && (
                  <span className="text-amber-600 ml-1">({validationResult.duplicates.length} duplicate(s) skipped)</span>
                )}
                {duplicateHandling === 'update' && validationResult.duplicates.length > 0 && (
                  <span className="text-blue-600 ml-1">({validationResult.duplicates.length} existing record(s) will be updated)</span>
                )}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            {validationResult && (
              <Button
                variant="outline"
                onClick={resetState}
                icon={<RefreshCw size={14} />}
              >
                Upload Different File
              </Button>
            )}
            <Button
              onClick={handleImport}
              icon={<ArrowRight size={16} />}
              disabled={!validationResult || getActionableCount() === 0 || isLoading}
            >
              Confirm & Import ({getActionableCount()})
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Step 1: Download Template Banner */}
        <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-xl p-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">
                Need the standard spreadsheet format?
              </h4>
              <p className="text-xs text-text-muted mt-0.5">
                Download the pre-formatted Excel template with sample {entityName.toLowerCase()} and instructions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDownloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary/30 text-primary text-xs font-semibold rounded-lg shadow-sm hover:bg-primary hover:text-white transition cursor-pointer shrink-0"
          >
            <Download size={14} />
            <span>Download Template</span>
          </button>
        </div>

        {/* Step 2: Upload Area (If no file uploaded yet) */}
        {!file && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-primary bg-primary/10 scale-[0.99]'
                  : 'border-border-light hover:border-primary/50 hover:bg-secondary/15'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-secondary/50 flex items-center justify-center text-primary">
                <UploadCloud size={28} />
              </div>
              <h3 className="text-sm font-bold text-text-primary">
                Drop your Excel (.xlsx, .xls) file here, or{' '}
                <span className="text-primary underline">browse</span>
              </h3>
              <p className="text-xs text-text-muted mt-1">
                Supports Microsoft Excel files up to 10MB
              </p>
            </div>

            {fileError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
                <XCircle size={16} className="shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Analysis & Preview Section */}
        {file && validationResult && (
          <div className="space-y-4">
            {/* File Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-secondary/20 border border-border-light rounded-xl px-4 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <FileCheck size={16} className="text-emerald-600" />
                <span className="font-bold text-text-primary">{file.name}</span>
                <span className="text-text-muted">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="flex items-center gap-1 text-danger hover:underline cursor-pointer font-medium"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>

            {/* Validation Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-background rounded-xl p-3 border border-border-light">
                <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total Rows</p>
                <p className="text-lg font-bold text-text-primary mt-0.5">{validationResult.totalRows}</p>
              </div>
              <div className="bg-emerald-50/70 rounded-xl p-3 border border-emerald-200">
                <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={13} /> Valid
                </p>
                <p className="text-lg font-bold text-emerald-700 mt-0.5">{validationResult.validRows.length}</p>
              </div>
              <div className="bg-red-50/70 rounded-xl p-3 border border-red-200">
                <p className="text-[11px] font-semibold text-red-800 uppercase tracking-wider flex items-center gap-1">
                  <XCircle size={13} /> Errors
                </p>
                <p className="text-lg font-bold text-red-600 mt-0.5">{validationResult.errorRows.length}</p>
              </div>
              <div className="bg-amber-50/70 rounded-xl p-3 border border-amber-200">
                <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle size={13} /> Duplicates
                </p>
                <p className="text-lg font-bold text-amber-600 mt-0.5">{validationResult.duplicates.length}</p>
              </div>
            </div>

            {/* Duplicate Handling Options (if any duplicates found) */}
            {validationResult.duplicates.length > 0 && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                  <h4 className="text-xs font-bold text-amber-900">
                    {validationResult.duplicates.length} duplicate identifier(s) found in existing database
                  </h4>
                </div>
                <p className="text-xs text-amber-800">
                  Choose how you would like the system to handle these matching records:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                      duplicateHandling === 'update'
                        ? 'border-primary bg-white shadow-sm ring-1 ring-primary'
                        : 'border-amber-200 hover:bg-white/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duplicateAction"
                      value="update"
                      checked={duplicateHandling === 'update'}
                      onChange={() => setDuplicateHandling('update')}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-text-primary block">🔄 Update Existing Records</span>
                      <span className="text-text-muted text-[11px]">
                        Overwrite existing records with uploaded Excel values.
                      </span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer text-xs transition ${
                      duplicateHandling === 'skip'
                        ? 'border-primary bg-white shadow-sm ring-1 ring-primary'
                        : 'border-amber-200 hover:bg-white/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="duplicateAction"
                      value="skip"
                      checked={duplicateHandling === 'skip'}
                      onChange={() => setDuplicateHandling('skip')}
                      className="mt-0.5 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-bold text-text-primary block">⏭️ Skip Duplicates</span>
                      <span className="text-text-muted text-[11px]">
                        Keep current records unchanged and only import completely new rows.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-border-light gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`pb-2.5 px-3 font-semibold transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
              >
                <span>Preview Valid Data</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
                  {validationResult.validRows.length}
                </span>
              </button>

              {validationResult.errorRows.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('errors')}
                  className={`pb-2.5 px-3 font-semibold transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'errors'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span>Validation Errors</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-100 text-red-800 font-bold">
                    {validationResult.errorRows.length}
                  </span>
                </button>
              )}

              {validationResult.duplicates.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('duplicates')}
                  className={`pb-2.5 px-3 font-semibold transition cursor-pointer border-b-2 flex items-center gap-1.5 ${
                    activeTab === 'duplicates'
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <span>Duplicates</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                    {validationResult.duplicates.length}
                  </span>
                </button>
              )}
            </div>

            {/* Tab 1: Valid Rows Preview Table */}
            {activeTab === 'preview' && (
              <div className="rounded-xl border border-border-light overflow-hidden">
                {validationResult.validRows.length === 0 ? (
                  <div className="p-8 text-center text-text-muted text-xs">
                    No valid rows found in the uploaded file. Please check the validation error tab.
                  </div>
                ) : (
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-xs">
                      <thead className="bg-secondary/40 sticky top-0 border-b border-border-light">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-text-secondary">#</th>
                          {previewColumns.map((col) => (
                            <th key={col.key} className="px-3 py-2 text-left font-semibold text-text-secondary whitespace-nowrap">
                              {col.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-light">
                        {validationResult.validRows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-secondary/15 transition-colors">
                            <td className="px-3 py-2 text-text-muted font-mono">{idx + 1}</td>
                            {previewColumns.map((col) => (
                              <td key={col.key} className="px-3 py-2 whitespace-nowrap text-text-primary">
                                {col.render ? col.render(row) : String(row[col.key] ?? '')}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Validation Errors Report Table */}
            {activeTab === 'errors' && (
              <div className="rounded-xl border border-red-200 overflow-hidden bg-red-50/20">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead className="bg-red-100/60 sticky top-0 border-b border-red-200 text-red-900">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Row #</th>
                        <th className="px-3 py-2 text-left font-semibold">Field / Column</th>
                        <th className="px-3 py-2 text-left font-semibold">Current Value</th>
                        <th className="px-3 py-2 text-left font-semibold">Error Message</th>
                        <th className="px-3 py-2 text-left font-semibold">Suggestion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-200/50">
                      {validationResult.errorRows.map((err, idx) => (
                        <tr key={idx} className="hover:bg-red-100/30 transition-colors">
                          <td className="px-3 py-2 font-mono font-bold text-red-700">Row {err.rowNumber}</td>
                          <td className="px-3 py-2 font-semibold text-text-primary">{err.field}</td>
                          <td className="px-3 py-2 font-mono text-text-muted">
                            {err.value !== undefined && err.value !== '' ? String(err.value) : '<empty>'}
                          </td>
                          <td className="px-3 py-2 text-red-600 font-medium">{err.error}</td>
                          <td className="px-3 py-2 text-emerald-700 text-[11px]">{err.suggestion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: Duplicates Table */}
            {activeTab === 'duplicates' && (
              <div className="rounded-xl border border-amber-200 overflow-hidden bg-amber-50/20">
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-xs">
                    <thead className="bg-amber-100/60 sticky top-0 border-b border-amber-200 text-amber-900">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Row #</th>
                        <th className="px-3 py-2 text-left font-semibold">Identifier</th>
                        <th className="px-3 py-2 text-left font-semibold">Handling Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-200/50">
                      {validationResult.duplicates.map((dup, idx) => (
                        <tr key={idx} className="hover:bg-amber-100/30 transition-colors">
                          <td className="px-3 py-2 font-mono font-bold text-amber-800">Row {dup.rowNumber}</td>
                          <td className="px-3 py-2 font-mono font-semibold text-text-primary">{dup.identifier}</td>
                          <td className="px-3 py-2">
                            {duplicateHandling === 'update' ? (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                                Overwrite existing record
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700">
                                Skip this row
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
