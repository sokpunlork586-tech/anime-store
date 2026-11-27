import { useState } from 'react';
import {
  CreditCard, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, RotateCcw, ExternalLink, Filter, Search, Settings2,
  Lock, Eye, ArrowUpRight, DollarSign, QrCode
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { PaymentProvider, PaymentTransaction } from '@/types';

export default function PaymentAccounts() {
  const {
    paymentProviders,
    updatePaymentProvider,
    paymentTransactions,
    verifyPaymentTransaction,
    refundPaymentTransaction,
    addToast,
  } = useApp();

  // Filters & State
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal States
  const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null);
  const [viewingTx, setViewingTx] = useState<PaymentTransaction | null>(null);
  const [refundingTx, setRefundingTx] = useState<PaymentTransaction | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState<string>('Customer cancellation request');

  // Form State for Provider Modal
  const [formMerchantId, setFormMerchantId] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [formWebhookSecret, setFormWebhookSecret] = useState('');
  const [formIsEnabled, setFormIsEnabled] = useState(true);
  const [formIsSandbox, setFormIsSandbox] = useState(true);
  const [formCurrency, setFormCurrency] = useState<'USD' | 'KHR'>('USD');

  const openConfigModal = (provider: PaymentProvider) => {
    setEditingProvider(provider);
    setFormMerchantId(provider.merchantId);
    setFormApiKey('');
    setFormWebhookSecret('');
    setFormIsEnabled(provider.isEnabled);
    setFormIsSandbox(provider.isSandbox);
    setFormCurrency(provider.currency);
  };

  const saveProviderConfig = () => {
    if (!editingProvider) return;
    updatePaymentProvider(editingProvider.code, {
      merchantId: formMerchantId.trim() || editingProvider.merchantId,
      isEnabled: formIsEnabled,
      isSandbox: formIsSandbox,
      currency: formCurrency,
      ...(formApiKey ? { apiKeyMasked: formApiKey.slice(0, 6) + '••••••••••••' + formApiKey.slice(-4) } : {}),
      ...(formWebhookSecret ? { webhookSecretMasked: formWebhookSecret.slice(0, 6) + '••••••••••••' + formWebhookSecret.slice(-4) } : {}),
    });
    setEditingProvider(null);
  };

  const handleOpenRefund = (tx: PaymentTransaction) => {
    setRefundingTx(tx);
    setRefundAmount(tx.amount);
    setRefundReason('Customer cancellation request');
  };

  const handleConfirmRefund = () => {
    if (!refundingTx) return;
    if (refundAmount <= 0 || refundAmount > refundingTx.amount) {
      addToast(`Refund amount must be between $0.01 and $${refundingTx.amount}`, 'error');
      return;
    }
    refundPaymentTransaction(refundingTx.id, refundAmount, refundReason);
    setRefundingTx(null);
  };

  // Filtered Transactions
  const filteredTransactions = paymentTransactions.filter((tx) => {
    const matchProv = selectedProvider === 'all' || tx.providerCode === selectedProvider;
    const matchStat = selectedStatus === 'all' || tx.status === selectedStatus;
    return matchProv && matchStat;
  });

  // Calculate Metrics
  const totalPaidVolume = paymentTransactions
    .filter((t) => t.status === 'PAID')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalRefunded = paymentTransactions
    .filter((t) => t.status === 'REFUNDED')
    .reduce((sum, t) => sum + (t.refundAmount || t.amount), 0);

  const pendingCount = paymentTransactions.filter((t) => t.status === 'PENDING' || t.status === 'PROCESSING').length;

  const columns = [
    {
      key: 'transactionId',
      label: 'Transaction ID',
      sortable: true,
      render: (tx: PaymentTransaction) => (
        <div>
          <span
            onClick={() => setViewingTx(tx)}
            className="font-mono text-xs font-bold text-primary hover:underline cursor-pointer block"
          >
            {tx.transactionId}
          </span>
          <span className="text-[11px] text-text-muted">{tx.orderNumber}</span>
        </div>
      ),
    },
    {
      key: 'provider',
      label: 'Gateway / Provider',
      render: (tx: PaymentTransaction) => {
        const prov = paymentProviders.find((p) => p.code === tx.providerCode);
        return (
          <div className="flex items-center gap-2">
            <span className="text-base">{tx.providerCode === 'aba_payway' ? '🏦' : tx.providerCode === 'khqr_bakong' ? '🇰🇭' : '💳'}</span>
            <div>
              <p className="font-semibold text-xs text-text-primary">{prov ? prov.name : tx.providerCode}</p>
              <p className="text-[11px] text-text-muted">{tx.paymentMethod}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (tx: PaymentTransaction) => (
        <div>
          <p className="font-medium text-xs text-text-primary">{tx.customerName}</p>
          <p className="text-[11px] text-text-muted">{tx.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (tx: PaymentTransaction) => (
        <span className="font-bold text-xs text-text-primary">
          {formatCurrency(tx.amount)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (tx: PaymentTransaction) => {
        let badgeVariant: any = 'pending';
        if (tx.status === 'PAID') badgeVariant = 'completed';
        else if (tx.status === 'REFUNDED') badgeVariant = 'refunded';
        else if (tx.status === 'FAILED' || tx.status === 'CANCELLED') badgeVariant = 'cancelled';
        return <StatusBadge status={badgeVariant} label={tx.status} />;
      },
    },
    {
      key: 'createdAt',
      label: 'Date & Time',
      sortable: true,
      render: (tx: PaymentTransaction) => (
        <span className="text-[11px] text-text-muted">{tx.createdAt}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <span>💳</span> Payment Accounts & Gateways
          </h1>
          <p className="text-[14px] font-normal text-text-muted">
            Configure ABA PayWay, KHQR / Bakong, and ACLEDA gateways. Monitor transaction statuses, manage server-side verifications and refunds.
          </p>
        </div>
      </div>

      {/* 3 Supported Payment Gateways Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {paymentProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-secondary/50 flex items-center justify-center text-xl font-bold text-primary">
                    {provider.code === 'aba_payway' ? '🏦' : provider.code === 'khqr_bakong' ? '🇰🇭' : '💳'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">{provider.name}</h3>
                    <p className="text-[11px] text-text-muted font-mono">{provider.code}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      provider.isEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {provider.isEnabled ? 'Active' : 'Disabled'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    {provider.isSandbox ? 'Sandbox Test' : 'Live Production'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                {provider.description}
              </p>

              <div className="bg-background rounded-xl p-3 border border-border-light space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-muted text-[11px]">Merchant ID:</span>
                  <span className="font-mono font-bold text-text-primary">{provider.merchantId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted text-[11px]">API Key:</span>
                  <span className="font-mono text-text-secondary text-[11px]">{provider.apiKeyMasked}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted text-[11px]">Currency:</span>
                  <span className="font-bold text-text-primary">{provider.currency}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-bold mb-1.5">Supported Methods:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.supportedMethods.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-secondary/30 text-text-primary text-[10px] font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border-light flex items-center justify-between">
              <span className="text-[11px] text-emerald-700 flex items-center gap-1 font-semibold">
                <ShieldCheck size={14} /> Server Verified
              </span>
              <button
                type="button"
                onClick={() => openConfigModal(provider)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-xs font-bold hover:bg-primary hover:text-white transition cursor-pointer"
              >
                <Settings2 size={13} />
                <span>Configure</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Verified Volume</p>
          <p className="text-[26px] font-bold text-emerald-600 mt-1 tabular-nums">{formatCurrency(totalPaidVolume)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Cleared through gateway webhooks</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Pending Transactions</p>
          <p className="text-[26px] font-bold text-amber-600 mt-1 tabular-nums">{pendingCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Awaiting QR scan or card OTP</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Refunded Volume</p>
          <p className="text-[26px] font-bold text-danger mt-1 tabular-nums">{formatCurrency(totalRefunded)}</p>
          <p className="text-[11px] text-text-muted mt-0.5">Authorized client cancellations</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-border-light shadow-sm">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Active Gateways</p>
          <p className="text-[26px] font-bold text-primary mt-1 tabular-nums">
            {paymentProviders.filter((p) => p.isEnabled).length} / {paymentProviders.length}
          </p>
          <p className="text-[11px] text-text-muted mt-0.5">ABA PayWay & KHQR Bakong online</p>
        </div>
      </div>

      {/* Main Transactions Table */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Payment Transactions</h2>
            <p className="text-xs text-text-muted">Real-time payment audit log with server verification and refund control</p>
          </div>
        </div>

        <DataTable<PaymentTransaction>
          data={filteredTransactions}
          columns={columns}
          searchKeys={['transactionId', 'orderNumber', 'customerName', 'customerEmail']}
          searchPlaceholder="Search txn ID, order #, customer..."
          itemsPerPage={8}
          filterSlot={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                <Filter size={14} className="text-text-muted" />
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                >
                  <option value="all">All Gateways</option>
                  <option value="aba_payway">ABA PayWay</option>
                  <option value="khqr_bakong">KHQR / Bakong</option>
                  <option value="acleda">ACLEDA Bank</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="REFUNDED">REFUNDED</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>
            </div>
          }
          actions={(tx) => (
            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => setViewingTx(tx)}
                title="View Full Details"
                className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-text-primary transition"
              >
                <Eye size={15} />
              </button>

              {tx.status === 'PENDING' && (
                <button
                  type="button"
                  onClick={() => verifyPaymentTransaction(tx.transactionId)}
                  title="Verify with Provider Server"
                  className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition"
                >
                  <RefreshCw size={15} />
                </button>
              )}

              {tx.status === 'PAID' && (
                <button
                  type="button"
                  onClick={() => handleOpenRefund(tx)}
                  title="Issue Refund"
                  className="p-1.5 rounded-lg hover:bg-red-50 text-danger hover:text-red-700 transition"
                >
                  <RotateCcw size={15} />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* Provider Config Modal */}
      {editingProvider && (
        <Modal
          isOpen={Boolean(editingProvider)}
          onClose={() => setEditingProvider(null)}
          title={`Configure ${editingProvider.name}`}
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setEditingProvider(null)}>
                Cancel
              </Button>
              <Button onClick={saveProviderConfig}>
                Save Gateway Credentials
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 flex items-center gap-2 text-primary font-semibold">
              <Lock size={15} />
              <span>Production Security: Secrets are hashed & verified exclusively server-side.</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border-light">
              <div>
                <p className="font-bold text-text-primary">Gateway Status</p>
                <p className="text-text-muted text-[11px]">Enable this gateway at checkout</p>
              </div>
              <input
                type="checkbox"
                checked={formIsEnabled}
                onChange={(e) => setFormIsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border-light">
              <div>
                <p className="font-bold text-text-primary">Sandbox Environment</p>
                <p className="text-text-muted text-[11px]">Test transactions without real bank debits</p>
              </div>
              <input
                type="checkbox"
                checked={formIsSandbox}
                onChange={(e) => setFormIsSandbox(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Merchant ID / Account Identifier</label>
              <input
                type="text"
                value={formMerchantId}
                onChange={(e) => setFormMerchantId(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">
                API Key (leave blank to keep {editingProvider.apiKeyMasked})
              </label>
              <input
                type="password"
                placeholder="Enter new gateway API key..."
                value={formApiKey}
                onChange={(e) => setFormApiKey(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">
                Webhook Secret (leave blank to keep {editingProvider.webhookSecretMasked})
              </label>
              <input
                type="password"
                placeholder="Enter webhook signature secret..."
                value={formWebhookSecret}
                onChange={(e) => setFormWebhookSecret(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Default Settlement Currency</label>
              <select
                value={formCurrency}
                onChange={(e) => setFormCurrency(e.target.value as any)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="USD">USD ($)</option>
                <option value="KHR">KHR (៛)</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* Transaction Details Modal */}
      {viewingTx && (
        <Modal
          isOpen={Boolean(viewingTx)}
          onClose={() => setViewingTx(null)}
          title={`Transaction ${viewingTx.transactionId}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <div>
                <p className="text-[11px] text-text-muted">Total Amount</p>
                <p className="text-xl font-bold text-text-primary mt-0.5">{formatCurrency(viewingTx.amount)}</p>
              </div>
              <StatusBadge status={viewingTx.status === 'PAID' ? 'completed' : viewingTx.status === 'REFUNDED' ? 'refunded' : 'pending'} label={viewingTx.status} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded-xl border border-border-light">
                <span className="text-text-muted text-[11px] block">Order Reference</span>
                <span className="font-bold text-text-primary font-mono">{viewingTx.orderNumber}</span>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border-light">
                <span className="text-text-muted text-[11px] block">Provider Gateway</span>
                <span className="font-bold text-text-primary">{viewingTx.providerCode.toUpperCase()}</span>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border-light">
                <span className="text-text-muted text-[11px] block">Customer Name</span>
                <span className="font-semibold text-text-primary">{viewingTx.customerName}</span>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border-light">
                <span className="text-text-muted text-[11px] block">Customer Email</span>
                <span className="text-text-primary truncate block">{viewingTx.customerEmail}</span>
              </div>
            </div>

            <div className="p-3 bg-background rounded-xl border border-border-light">
              <span className="text-text-muted text-[11px] block">Payment Method & Routing</span>
              <span className="font-medium text-text-primary block mt-0.5">{viewingTx.paymentMethod}</span>
              <span className="text-[11px] text-text-muted block mt-1">Audit Notes: {viewingTx.notes || 'None'}</span>
            </div>

            {viewingTx.status === 'REFUNDED' && (
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-800">
                <p className="font-bold">Refund Record:</p>
                <p className="text-[11px] mt-0.5">Refunded: {formatCurrency(viewingTx.refundAmount || viewingTx.amount)}</p>
                <p className="text-[11px]">Reason: {viewingTx.refundReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Refund Modal */}
      {refundingTx && (
        <Modal
          isOpen={Boolean(refundingTx)}
          onClose={() => setRefundingTx(null)}
          title={`Process Refund for ${refundingTx.transactionId}`}
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setRefundingTx(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRefund}>
                Confirm Refund ({formatCurrency(refundAmount)})
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800">
              <AlertTriangle size={16} className="shrink-0" />
              <span>Refunds will issue a reversal record and notify the customer.</span>
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">
                Refund Amount ($) [Max: {formatCurrency(refundingTx.amount)}]
              </label>
              <input
                type="number"
                step="0.01"
                max={refundingTx.amount}
                min="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-base font-semibold text-text-primary mb-1.5">Refund Reason</label>
              <textarea
                rows={3}
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-4 py-2.5 text-base sm:text-sm bg-white border border-border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
