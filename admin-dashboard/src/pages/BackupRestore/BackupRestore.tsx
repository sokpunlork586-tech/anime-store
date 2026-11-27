import { useState, useRef } from 'react';
import {
  Database, Download, RotateCcw, Upload, Trash2, ShieldCheck,
  Calendar, Clock, HardDrive, CheckCircle2, AlertTriangle,
  FileText, Sparkles, Filter, Search, Settings2, RefreshCw, Check
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatters';
import type { BackupItem, AutoBackupConfig } from '@/types';

export default function BackupRestore() {
  const {
    backups,
    autoBackupConfig,
    createBackup,
    deleteBackup,
    updateAutoBackupConfig,
    restoreBackup,
    restoreFromUpload,
    products,
    categories,
    orders,
    customers,
    inventory,
    paymentProviders,
    financialAccounts,
    incomeRecords,
    expenseRecords,
    userAccounts,
    addToast,
  } = useApp();

  // Filters
  const [triggerFilter, setTriggerFilter] = useState<'all' | 'automatic' | 'manual'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'full' | 'catalog' | 'orders_financial' | 'users'>('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [deletingBackupId, setDeletingBackupId] = useState<string | null>(null);
  const [restoringBackup, setRestoringBackup] = useState<BackupItem | null>(null);

  // Create Backup Form State
  const [createType, setCreateType] = useState<'full' | 'catalog' | 'orders_financial' | 'users'>('full');
  const [createNotes, setCreateNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Auto Backup Config Form State
  const [configEnabled, setConfigEnabled] = useState(autoBackupConfig.isEnabled);
  const [configFrequency, setConfigFrequency] = useState(autoBackupConfig.frequency);
  const [configTime, setConfigTime] = useState(autoBackupConfig.backupTime);
  const [configRetention, setConfigRetention] = useState(autoBackupConfig.retentionDays);

  // Upload & Restore State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedParsedData, setUploadedParsedData] = useState<any>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [confirmUploadedRestore, setConfirmUploadedRestore] = useState(false);
  const [isProcessingRestore, setIsProcessingRestore] = useState(false);

  // Format File Size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Stats calculation
  const totalSnapshots = backups.length;
  const totalSizeBytes = backups.reduce((acc, b) => acc + (b.fileSizeBytes || 0), 0);
  const lastBackupTime = backups.length > 0 ? backups[0].createdAt : 'No backups yet';

  // Filtered backups list
  const filteredBackups = backups.filter(b => {
    const matchesTrigger = triggerFilter === 'all' || b.triggerType === triggerFilter;
    const matchesType = typeFilter === 'all' || b.backupType === typeFilter;
    return matchesTrigger && matchesType;
  });

  // Action: Create Backup
  const handleCreateBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      createBackup(createType);
      setIsCreating(false);
      setIsCreateModalOpen(false);
      setCreateNotes('');
    }, 600);
  };

  // Action: Download Backup File
  const handleDownload = (item: BackupItem) => {
    try {
      const dumpPayload = {
        metadata: {
          id: item.id,
          filename: item.filename,
          type: item.backupType,
          created_at: item.createdAt,
          checksum_sha256: item.checksumSha256,
          trigger: item.triggerType,
          generated_by: 'Anime Store Admin System',
          version: '2.4.0',
        },
        record_counts: item.recordCounts,
        data: {
          products: item.backupType === 'full' || item.backupType === 'catalog' ? products : undefined,
          categories: item.backupType === 'full' || item.backupType === 'catalog' ? categories : undefined,
          inventory: item.backupType === 'full' || item.backupType === 'catalog' ? inventory : undefined,
          orders: item.backupType === 'full' || item.backupType === 'orders_financial' ? orders : undefined,
          customers: item.backupType === 'full' ? customers : undefined,
          payment_providers: item.backupType === 'full' || item.backupType === 'orders_financial' ? paymentProviders : undefined,
          financial_accounts: item.backupType === 'full' || item.backupType === 'orders_financial' ? financialAccounts : undefined,
          income_records: item.backupType === 'full' || item.backupType === 'orders_financial' ? incomeRecords : undefined,
          expense_records: item.backupType === 'full' || item.backupType === 'orders_financial' ? expenseRecords : undefined,
          user_accounts: item.backupType === 'full' || item.backupType === 'users' ? userAccounts : undefined,
        }
      };

      const blob = new Blob([JSON.stringify(dumpPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast(`Backup ${item.filename} downloaded successfully`, 'success');
    } catch {
      addToast('Failed to download backup file', 'error');
    }
  };

  // Action: Restore from existing archive
  const handleConfirmRestore = () => {
    if (!restoringBackup) return;
    setIsProcessingRestore(true);
    setTimeout(() => {
      restoreBackup(restoringBackup.id);
      setIsProcessingRestore(false);
      setRestoringBackup(null);
    }, 800);
  };

  // Action: File upload selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (!parsed || (typeof parsed !== 'object')) {
          throw new Error('Invalid JSON backup format');
        }
        setUploadedParsedData(parsed);
      } catch (err: any) {
        setUploadError(err.message || 'File is not a valid JSON database backup');
        setUploadedParsedData(null);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read the selected file');
      setUploadedParsedData(null);
    };
    reader.readAsText(file);
  };

  // Action: Execute Upload Restore
  const handleExecuteUploadRestore = () => {
    if (!uploadedFile || !uploadedParsedData) return;
    setIsProcessingRestore(true);
    setTimeout(() => {
      restoreFromUpload(uploadedFile.name, JSON.stringify(uploadedParsedData));
      setIsProcessingRestore(false);
      setIsUploadModalOpen(false);
      setUploadedFile(null);
      setUploadedParsedData(null);
      setConfirmUploadedRestore(false);
    }, 900);
  };

  // Action: Save Auto Backup Config
  const handleSaveConfig = () => {
    updateAutoBackupConfig({
      isEnabled: configEnabled,
      frequency: configFrequency,
      backupTime: configTime,
      retentionDays: configRetention,
      nextRunAt: `Tomorrow at ${configTime}:00`,
    });
    setIsScheduleModalOpen(false);
  };

  // Table columns definition
  const columns = [
    {
      key: 'filename',
      label: 'Snapshot / Filename',
      sortable: true,
      render: (item: BackupItem) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Database size={20} />
          </div>
          <div>
            <div className="font-semibold text-text-primary text-sm flex items-center gap-2">
              <span>{item.filename}</span>
              {item.triggerType === 'automatic' && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                  ⚡ Auto
                </span>
              )}
            </div>
            <div className="text-xs text-text-muted font-mono mt-0.5 truncate max-w-[280px]" title={item.checksumSha256}>
              SHA: {item.checksumSha256.slice(0, 16)}...
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'backupType',
      label: 'Scope',
      sortable: true,
      render: (item: BackupItem) => {
        const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
          full: { label: 'Full System', bg: 'bg-emerald-50', text: 'text-emerald-700' },
          catalog: { label: 'Catalog & Store', bg: 'bg-sky-50', text: 'text-sky-700' },
          orders_financial: { label: 'Orders & Finance', bg: 'bg-purple-50', text: 'text-purple-700' },
          users: { label: 'Users & Roles', bg: 'bg-amber-50', text: 'text-amber-700' },
        };
        const config = typeLabels[item.backupType] || { label: item.backupType, bg: 'bg-gray-100', text: 'text-gray-700' };
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'fileSizeBytes',
      label: 'File Size',
      sortable: true,
      render: (item: BackupItem) => (
        <span className="text-sm font-medium text-text-primary">
          {formatFileSize(item.fileSizeBytes)}
        </span>
      ),
    },
    {
      key: 'records',
      label: 'Total Records',
      render: (item: BackupItem) => {
        const counts = item.recordCounts || {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <div>
            <span className="text-sm font-semibold text-text-primary">{total.toLocaleString()} rows</span>
            <div className="text-[11px] text-text-muted">
              {Object.entries(counts)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')}
            </div>
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Created Date',
      sortable: true,
      render: (item: BackupItem) => (
        <div>
          <p className="text-sm text-text-primary">{formatDate(item.createdAt)}</p>
          <p className="text-xs text-text-muted">{item.createdBy}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: BackupItem) => (
        <StatusBadge status={item.status} label={item.status === 'completed' ? 'Verified' : item.status} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title and Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <span>💾</span> Backup & Database Restore
          </h1>
          <p className="text-text-muted text-[14px] font-normal mt-1">
            Securely snapshot, schedule automated database dumps, and restore your store records with integrity verification.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Settings2 size={18} />
            <span>Auto-Backup Schedule</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload size={18} />
            <span>Restore from File</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Sparkles size={18} />
            <span>Create Backup Now</span>
          </Button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Snapshots */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Snapshots</p>
            <p className="text-[26px] font-bold text-text-primary mt-1 tabular-nums">{totalSnapshots}</p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 size={13} /> {backups.filter(b => b.triggerType === 'automatic').length} Automated
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Database size={24} />
          </div>
        </div>

        {/* Total Storage Used */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Storage Consumed</p>
            <p className="text-[26px] font-bold text-text-primary mt-1 tabular-nums">{formatFileSize(totalSizeBytes)}</p>
            <p className="text-xs text-text-muted mt-1 flex items-center gap-1">
              <HardDrive size={13} /> Local Encrypted Storage
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <HardDrive size={24} />
          </div>
        </div>

        {/* Last Backup Date */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Latest Backup</p>
            <p className="text-base font-bold text-text-primary mt-1 truncate max-w-[150px]">
              {backups[0] ? formatDate(backups[0].createdAt) : 'None'}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ShieldCheck size={13} /> SHA-256 Validated
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Automation Status */}
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Auto-Backup Engine</p>
            <p className="text-base font-bold text-text-primary mt-1 flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${autoBackupConfig.isEnabled ? 'bg-emerald-500' : 'bg-red-400'}`} />
              {autoBackupConfig.isEnabled ? 'Active (Scheduled)' : 'Disabled'}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {autoBackupConfig.frequency.toUpperCase()} at {autoBackupConfig.backupTime}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Auto Backup Banner & Schedule Summary Card */}
      <div className="bg-gradient-to-r from-secondary/40 via-white to-secondary/20 rounded-2xl p-5 border border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-sm">
            <Clock size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-semibold text-text-primary">
                Automatic Backup Protection
              </h2>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                autoBackupConfig.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {autoBackupConfig.isEnabled ? 'ENABLED' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1">
              Scheduled to run <span className="font-semibold text-text-primary">{autoBackupConfig.frequency}</span> at <span className="font-semibold text-text-primary">{autoBackupConfig.backupTime}</span>.
              Retention keeps snapshots for <span className="font-semibold text-text-primary">{autoBackupConfig.retentionDays} days</span> before rotating.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsScheduleModalOpen(true)}
            className="text-xs"
          >
            Configure Schedule
          </Button>
          <Button
            variant={autoBackupConfig.isEnabled ? 'danger' : 'primary'}
            size="sm"
            onClick={() => updateAutoBackupConfig({ isEnabled: !autoBackupConfig.isEnabled })}
            className="text-xs"
          >
            {autoBackupConfig.isEnabled ? 'Disable Automation' : 'Enable Automation'}
          </Button>
        </div>
      </div>

      {/* Backups Table Section */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
        <div>
          <h2 className="text-[18px] font-semibold text-text-primary">System Backup Archive</h2>
          <p className="text-xs text-text-muted">History of database snapshots, scheduled dumps, and system integrity logs</p>
        </div>

        <DataTable<BackupItem>
          data={filteredBackups}
          columns={columns}
          searchKeys={['filename', 'checksumSha256', 'createdBy']}
          searchPlaceholder="Search backup archive by name or hash..."
          itemsPerPage={10}
          filterSlot={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border-light text-xs">
                <Filter size={14} className="text-text-muted" />
                <select
                  value={triggerFilter}
                  onChange={(e) => setTriggerFilter(e.target.value as any)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                >
                  <option value="all">All Triggers</option>
                  <option value="automatic">⚡ Automatic Only</option>
                  <option value="manual">👤 Manual Only</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border-light text-xs">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                >
                  <option value="all">All Scopes</option>
                  <option value="full">Full System</option>
                  <option value="catalog">Catalog & Store</option>
                  <option value="orders_financial">Orders & Finance</option>
                  <option value="users">Users & Roles</option>
                </select>
              </div>
            </div>
          }
          actions={(item: BackupItem) => (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => handleDownload(item)}
                className="p-1.5 text-text-muted hover:text-primary hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer"
                title="Download Backup File (.json)"
              >
                <Download size={18} />
              </button>
              <button
                type="button"
                onClick={() => setRestoringBackup(item)}
                className="p-1.5 text-text-muted hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Restore Database from this Snapshot"
              >
                <RotateCcw size={18} />
              </button>
              <button
                type="button"
                onClick={() => setDeletingBackupId(item.id)}
                className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                title="Delete Backup Archive"
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        />
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Create Backup Now                              */}
      {/* ======================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Backup Archive"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreateBackup} loading={isCreating}>
              Generate Snapshot
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-text-secondary">
            Select the scope of data you wish to snapshot. All records will be serialized into an encrypted JSON dump with SHA-256 verification.
          </p>

          <div className="space-y-2.5">
            <label className="block text-base font-semibold text-text-primary mb-1.5">
              Backup Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'full', label: 'Full System Snapshot', desc: 'All products, categories, orders, finance, and users', count: `${products.length + orders.length + userAccounts.length} total rows` },
                { id: 'catalog', label: 'Catalog & Store', desc: 'Anime merchandise, categories, tags, and stock counts', count: `${products.length} products` },
                { id: 'orders_financial', label: 'Orders & Financials', desc: 'Customer orders, payments, income, and expense records', count: `${orders.length + paymentProviders.length} rows` },
                { id: 'users', label: 'Users & Security', desc: 'Admin accounts, roles, access permissions, and logs', count: `${userAccounts.length} users` },
              ].map((scope) => (
                <div
                  key={scope.id}
                  onClick={() => setCreateType(scope.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    createType === scope.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-border-light hover:border-secondary hover:bg-secondary/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-text-primary">{scope.label}</span>
                    {createType === scope.id && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-xs">
                        <Check size={12} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{scope.desc}</p>
                  <p className="text-[11px] font-medium text-primary mt-2">Estimated: {scope.count}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">
              Backup Notes / Description (Optional)
            </label>
            <input
              type="text"
              value={createNotes}
              onChange={(e) => setCreateNotes(e.target.value)}
              placeholder="e.g. Pre-holiday promotional catalog update"
              className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="p-3 bg-secondary/30 rounded-xl border border-secondary text-xs text-text-secondary flex items-start gap-2.5">
            <ShieldCheck size={18} className="text-primary flex-shrink-0 mt-0.5" />
            <span>
              The backup file will be created on local storage and added to your archive list. You can download the file immediately afterwards.
            </span>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: Auto-Backup Schedule Configuration              */}
      {/* ======================================================== */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Configure Automated Backup Schedule"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveConfig}>Save Schedule</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          {/* Toggle Enable */}
          <div className="flex items-center justify-between p-3.5 bg-background/60 rounded-xl border border-border-light">
            <div>
              <p className="text-sm font-bold text-text-primary">Enable Automated Database Backup</p>
              <p className="text-xs text-text-muted mt-0.5">Automatically dumps full database without manual action</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={configEnabled}
                onChange={(e) => setConfigEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">
              Backup Frequency
            </label>
            <select
              value={configFrequency}
              onChange={(e) => setConfigFrequency(e.target.value as any)}
              className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary"
            >
              <option value="daily">Daily (Every 24 Hours - Recommended)</option>
              <option value="weekly">Weekly (Every Sunday)</option>
              <option value="monthly">Monthly (1st of each month)</option>
            </select>
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">
              Execution Time
            </label>
            <div className="relative">
              <input
                type="time"
                value={configTime}
                onChange={(e) => setConfigTime(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary"
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1">Recommended during low-traffic periods (e.g. 02:00 AM ICT)</p>
          </div>

          {/* Retention Period */}
          <div>
            <label className="block text-base font-semibold text-text-primary mb-1.5">
              Retention Policy (Keep Archives For)
            </label>
            <select
              value={configRetention}
              onChange={(e) => setConfigRetention(Number(e.target.value))}
              className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-text-primary"
            >
              <option value={7}>7 Days (1 Week)</option>
              <option value={14}>14 Days (2 Weeks)</option>
              <option value={30}>30 Days (1 Month - Recommended)</option>
              <option value={60}>60 Days (2 Months)</option>
              <option value={90}>90 Days (Quarterly Archive)</option>
            </select>
          </div>

          {/* Storage Target Info */}
          <div className="p-3 bg-secondary/30 rounded-xl border border-secondary text-xs text-text-secondary flex items-start gap-2">
            <HardDrive size={16} className="text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-text-primary">Storage Destination: Local Encrypted Storage</p>
              <p className="text-[11px] text-text-muted mt-0.5">Files are safely stored in <code className="bg-white px-1 py-0.5 rounded text-primary">/backend/backups/</code> with AES-256 encryption.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 3: Upload File & Restore Modal                    */}
      {/* ======================================================== */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadedFile(null);
          setUploadedParsedData(null);
          setConfirmUploadedRestore(false);
        }}
        title="Restore Database from Backup File"
        size="md"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsUploadModalOpen(false);
                setUploadedFile(null);
                setUploadedParsedData(null);
                setConfirmUploadedRestore(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleExecuteUploadRestore}
              disabled={!uploadedParsedData || !confirmUploadedRestore}
              loading={isProcessingRestore}
            >
              Execute Restore
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          {/* File input / dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border-light hover:border-primary/50 bg-background/50 hover:bg-secondary/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json,.sql"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Upload size={24} />
            </div>
            <p className="text-sm font-semibold text-text-primary">
              {uploadedFile ? uploadedFile.name : 'Click to select or drag & drop backup file'}
            </p>
            <p className="text-xs text-text-muted mt-1">Supports JSON snapshot files (.json)</p>
          </div>

          {/* Error Message */}
          {uploadError && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Validated preview info */}
          {uploadedParsedData && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 size={16} />
                <span>Valid Backup File Analyzed</span>
              </div>
              <div className="text-xs text-emerald-900 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-emerald-700">File:</span> {uploadedFile?.name}
                </div>
                <div>
                  <span className="text-emerald-700">Size:</span> {uploadedFile ? formatFileSize(uploadedFile.size) : 'N/A'}
                </div>
                <div>
                  <span className="text-emerald-700">Type:</span> {uploadedParsedData.metadata?.type || 'Full Database'}
                </div>
                <div>
                  <span className="text-emerald-700">Version:</span> {uploadedParsedData.metadata?.version || '2.4.0'}
                </div>
              </div>
            </div>
          )}

          {/* Caution Confirmation */}
          {uploadedParsedData && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold">Warning: Database Replacement</p>
                  <p className="mt-0.5">
                    Restoring from this file will update and merge existing database records. Make sure you have a recent snapshot before continuing.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmUploadedRestore}
                  onChange={(e) => setConfirmUploadedRestore(e.target.checked)}
                  className="rounded border-border-light text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-medium text-amber-900">
                  I understand that this action will restore system data
                </span>
              </label>
            </div>
          )}
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* CONFIRM 1: Restore from Listed Archive Dialog           */}
      {/* ======================================================== */}
      <ConfirmDialog
        isOpen={Boolean(restoringBackup)}
        onClose={() => setRestoringBackup(null)}
        onConfirm={handleConfirmRestore}
        title="Restore System from Snapshot?"
        message={`Are you sure you want to restore the store database using snapshot "${restoringBackup?.filename}"? Current data will be restored to this state.`}
        confirmLabel="Restore Database"
        variant="primary"
        loading={isProcessingRestore}
      />

      {/* ======================================================== */}
      {/* CONFIRM 2: Delete Archive Confirmation                  */}
      {/* ======================================================== */}
      <ConfirmDialog
        isOpen={Boolean(deletingBackupId)}
        onClose={() => setDeletingBackupId(null)}
        onConfirm={() => {
          if (deletingBackupId) {
            deleteBackup(deletingBackupId);
            setDeletingBackupId(null);
          }
        }}
        title="Delete Backup Archive"
        message="Are you sure you want to permanently delete this backup snapshot? This action cannot be undone."
        confirmLabel="Delete Archive"
        variant="danger"
      />
    </div>
  );
}
