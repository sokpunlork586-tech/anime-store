import { useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Wallet, Plus,
  Calendar, FileText, ArrowUpRight, ArrowDownRight, Filter,
  PieChart as PieIcon, BarChart3, Building2, CreditCard, Edit, Eye
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar, Legend
} from 'recharts';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { FinancialAccount, IncomeRecord, ExpenseRecord } from '@/types';

export default function FinancialAccounts() {
  const {
    financialAccounts,
    incomeRecords,
    expenseRecords,
    addIncomeRecord,
    addExpenseRecord,
    updateExpenseRecord,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'income' | 'expenses' | 'overview'>('overview');
  const [reportPeriod, setReportPeriod] = useState<'monthly' | 'weekly' | 'yearly'>('monthly');

  // Income Modal State
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [incTitle, setIncTitle] = useState('');
  const [incCategory, setIncCategory] = useState<IncomeRecord['category']>('Sales');
  const [incAmount, setIncAmount] = useState<number>(0);
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incRef, setIncRef] = useState('');
  const [incMethod, setIncMethod] = useState('ABA PayWay');
  const [incAccount, setIncAccount] = useState('ABA Main Merchant Account');
  const [incNotes, setIncNotes] = useState('');

  // Expense Modal State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [expTitle, setExpTitle] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseRecord['category']>('Inventory Import');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expDate, setExpDate] = useState(new Date().toISOString().split('T')[0]);
  const [expMethod, setExpMethod] = useState('Wire Transfer');
  const [expAccount, setExpAccount] = useState('ABA Main Merchant Account');
  const [expReceipt, setExpReceipt] = useState('');
  const [expNotes, setExpNotes] = useState('');

  // Financial Summary calculations
  const totalIncome = useMemo(() => {
    return incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [incomeRecords]);

  const totalExpense = useMemo(() => {
    return expenseRecords.reduce((sum, r) => sum + r.amount, 0);
  }, [expenseRecords]);

  // Net Profit = Total Revenue - Total Expenses
  const netProfit = totalIncome - totalExpense;

  const totalBankBalance = useMemo(() => {
    return financialAccounts.filter((a) => a.isActive).reduce((sum, a) => sum + a.balance, 0);
  }, [financialAccounts]);

  // Chart data based on reportPeriod
  const chartData = useMemo(() => {
    if (reportPeriod === 'weekly') {
      return [
        { period: 'Week 1', revenue: 4200, expenses: 1450, profit: 2750 },
        { period: 'Week 2', revenue: 5100, expenses: 1800, profit: 3300 },
        { period: 'Week 3', revenue: 4600, expenses: 1200, profit: 3400 },
        { period: 'Week 4', revenue: 6100, expenses: 2100, profit: 4000 },
      ];
    } else if (reportPeriod === 'yearly') {
      return [
        { period: '2023', revenue: 98000, expenses: 38000, profit: 60000 },
        { period: '2024', revenue: 142000, expenses: 49000, profit: 93000 },
        { period: '2025', revenue: 185000, expenses: 58000, profit: 127000 },
        { period: '2026 YTD', revenue: totalIncome, expenses: totalExpense, profit: netProfit },
      ];
    } else {
      return [
        { period: 'Jun', revenue: 12400, expenses: 4100, profit: 8300 },
        { period: 'Jul', revenue: 14100, expenses: 4800, profit: 9300 },
        { period: 'Aug', revenue: 13900, expenses: 5200, profit: 8700 },
        { period: 'Sep', revenue: 16800, expenses: 5400, profit: 11400 },
        { period: 'Oct', revenue: 18900, expenses: 6200, profit: 12700 },
        { period: 'Nov', revenue: totalIncome, expenses: totalExpense, profit: netProfit },
      ];
    }
  }, [reportPeriod, totalIncome, totalExpense, netProfit]);

  // Handlers for Income
  const handleSaveIncome = () => {
    if (!incTitle.trim() || incAmount <= 0) {
      addToast('Please enter title and valid positive amount', 'error');
      return;
    }
    addIncomeRecord({
      title: incTitle.trim(),
      category: incCategory,
      amount: incAmount,
      currency: 'USD',
      date: incDate,
      referenceNumber: incRef.trim() || `INC-${Date.now().toString().slice(-6)}`,
      paymentMethod: incMethod,
      accountName: incAccount,
      notes: incNotes.trim(),
      createdBy: 'Finance Admin',
    });
    setIsAddIncomeOpen(false);
    setIncTitle('');
    setIncAmount(0);
    setIncRef('');
    setIncNotes('');
  };

  // Handlers for Expense
  const handleSaveExpense = () => {
    if (!expTitle.trim() || expAmount <= 0) {
      addToast('Please enter title and valid positive amount', 'error');
      return;
    }

    if (editingExpense) {
      updateExpenseRecord(editingExpense.id, {
        title: expTitle.trim(),
        category: expCategory,
        amount: expAmount,
        date: expDate,
        paymentMethod: expMethod,
        accountName: expAccount,
        receiptUrl: expReceipt.trim(),
        notes: expNotes.trim(),
      });
      setEditingExpense(null);
    } else {
      addExpenseRecord({
        title: expTitle.trim(),
        category: expCategory,
        amount: expAmount,
        currency: 'USD',
        date: expDate,
        paymentMethod: expMethod,
        accountName: expAccount,
        receiptUrl: expReceipt.trim(),
        notes: expNotes.trim(),
        createdBy: 'Finance Admin',
      });
      setIsAddExpenseOpen(false);
    }
    setExpTitle('');
    setExpAmount(0);
    setExpReceipt('');
    setExpNotes('');
  };

  const openEditExpense = (e: ExpenseRecord) => {
    setEditingExpense(e);
    setExpTitle(e.title);
    setExpCategory(e.category);
    setExpAmount(e.amount);
    setExpDate(e.date);
    setExpMethod(e.paymentMethod);
    setExpAccount(e.accountName);
    setExpReceipt(e.receiptUrl || '');
    setExpNotes(e.notes || '');
  };

  // Income Columns
  const incomeColumns = [
    {
      key: 'title',
      label: 'Income Item',
      sortable: true,
      render: (r: IncomeRecord) => (
        <div>
          <p className="font-semibold text-xs text-text-primary">{r.title}</p>
          <span className="text-[11px] font-mono text-text-muted">{r.referenceNumber}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (r: IncomeRecord) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
          {r.category}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount ($)',
      sortable: true,
      render: (r: IncomeRecord) => (
        <span className="font-bold text-xs text-emerald-700">
          +{formatCurrency(r.amount)}
        </span>
      ),
    },
    {
      key: 'accountName',
      label: 'Settled Into',
      render: (r: IncomeRecord) => (
        <span className="text-xs text-text-secondary">{r.accountName}</span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (r: IncomeRecord) => <span className="text-xs text-text-muted">{formatDate(r.date)}</span>,
    },
    {
      key: 'createdBy',
      label: 'Recorded By',
      render: (r: IncomeRecord) => <span className="text-[11px] text-text-secondary">{r.createdBy}</span>,
    },
  ];

  // Expense Columns
  const expenseColumns = [
    {
      key: 'title',
      label: 'Expense Item',
      sortable: true,
      render: (e: ExpenseRecord) => (
        <div>
          <p className="font-semibold text-xs text-text-primary">{e.title}</p>
          <p className="text-[11px] text-text-muted">{e.paymentMethod}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (e: ExpenseRecord) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
          {e.category}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount ($)',
      sortable: true,
      render: (e: ExpenseRecord) => (
        <span className="font-bold text-xs text-danger">
          -{formatCurrency(e.amount)}
        </span>
      ),
    },
    {
      key: 'accountName',
      label: 'Drawn From',
      render: (e: ExpenseRecord) => <span className="text-xs text-text-secondary">{e.accountName}</span>,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (e: ExpenseRecord) => <span className="text-xs text-text-muted">{formatDate(e.date)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary flex items-center gap-2">
            <span>💰</span> Financial Accounts & P&L Reports
          </h1>
          <p className="text-[14px] font-normal text-text-muted">
            Track gross revenue, store operation expenses, net profit margins, and manage corporate bank accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddIncomeOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[14px] font-medium shadow-sm transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Income</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddExpenseOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-accent text-white text-[14px] font-medium shadow-sm transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Core Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-[26px] font-bold text-text-primary mt-2 tabular-nums">{formatCurrency(totalIncome)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight size={12} /> Confirmed gross sales & income
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Total Expenses</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-[26px] font-bold text-danger mt-2 tabular-nums">{formatCurrency(totalExpense)}</p>
          <span className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
            <ArrowDownRight size={12} /> Figure imports, logistics & payroll
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm bg-gradient-to-br from-white to-secondary/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Net Profit</span>
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className={`text-[26px] font-bold mt-2 tabular-nums ${netProfit >= 0 ? 'text-primary' : 'text-danger'}`}>
            {formatCurrency(netProfit)}
          </p>
          <span className="text-[11px] text-primary font-bold block mt-1">
            Net Profit = Revenue - Expenses
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Available Vault Balance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Wallet size={16} />
            </div>
          </div>
          <p className="text-[26px] font-bold text-blue-700 mt-2 tabular-nums">{formatCurrency(totalBankBalance)}</p>
          <span className="text-[11px] text-text-muted block mt-1">Across {financialAccounts.length} active corporate banks</span>
        </div>
      </div>

      {/* Corporate Bank Accounts Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {financialAccounts.map((acc) => (
          <div key={acc.id} className="bg-white rounded-2xl p-4 border border-border-light shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center text-primary font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">{acc.accountName}</h4>
                <p className="text-[11px] text-text-muted font-mono">{acc.accountNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-text-primary block">{formatCurrency(acc.balance)}</span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase">{acc.bankName}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Trend Chart */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-semibold text-text-primary">Profit & Loss Financial Trends</h2>
            <p className="text-xs text-text-muted">Visual breakdown of Revenue vs Expenses vs Net Profit margins</p>
          </div>
          <div className="flex items-center gap-1.5 bg-background p-1 rounded-xl border border-border-light text-xs">
            {(['weekly', 'monthly', 'yearly'] as const).map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setReportPeriod(period)}
                className={`px-3 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                  reportPeriod === period ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D96532" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D96532" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E6D8" vertical={false} />
              <XAxis dataKey="period" stroke="#9A857D" fontSize={11} tickLine={false} />
              <YAxis stroke="#9A857D" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #EADCC8', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              <Area type="monotone" dataKey="expenses" name="Expenses ($)" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              <Area type="monotone" dataKey="profit" name="Net Profit ($)" stroke="#D96532" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabbed Ledgers (Income & Expenses) */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
        <div className="flex items-center border-b border-border-light gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            All Ledgers ({incomeRecords.length + expenseRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('income')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activeTab === 'income' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Income History ({incomeRecords.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('expenses')}
            className={`pb-3 font-bold text-xs uppercase tracking-wider transition cursor-pointer border-b-2 ${
              activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Expense Records ({expenseRecords.length})
          </button>
        </div>

        {/* Tab 1: Income Table */}
        {(activeTab === 'overview' || activeTab === 'income') && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center justify-between">
              <span>Income & Sales Transactions</span>
              <span className="text-xs font-semibold text-emerald-600">Total: +{formatCurrency(totalIncome)}</span>
            </h3>
            <DataTable<IncomeRecord>
              data={incomeRecords}
              columns={incomeColumns}
              searchKeys={['title', 'referenceNumber', 'category', 'paymentMethod']}
              searchPlaceholder="Search income records..."
              itemsPerPage={6}
            />
          </div>
        )}

        {/* Tab 2: Expenses Table */}
        {(activeTab === 'overview' || activeTab === 'expenses') && (
          <div className="space-y-3 pt-4 border-t border-border-light">
            <h3 className="text-sm font-bold text-text-primary flex items-center justify-between">
              <span>Operational Expense Records</span>
              <span className="text-xs font-semibold text-danger">Total: -{formatCurrency(totalExpense)}</span>
            </h3>
            <DataTable<ExpenseRecord>
              data={expenseRecords}
              columns={expenseColumns}
              searchKeys={['title', 'category', 'paymentMethod']}
              searchPlaceholder="Search expenses..."
              itemsPerPage={6}
              actions={(exp) => (
                <button
                  type="button"
                  onClick={() => openEditExpense(exp)}
                  title="Edit Expense"
                  className="p-1.5 rounded-lg hover:bg-secondary/60 text-text-muted hover:text-primary transition"
                >
                  <Edit size={14} />
                </button>
              )}
            />
          </div>
        )}
      </div>

      {/* Add Income Modal */}
      {isAddIncomeOpen && (
        <Modal
          isOpen={isAddIncomeOpen}
          onClose={() => setIsAddIncomeOpen(false)}
          title="Add Verified Income Record"
          size="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsAddIncomeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIncome}>
                Save Income Record
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Income Title</label>
              <input
                type="text"
                placeholder="e.g. Comic Con Merch Booth Sales"
                value={incTitle}
                onChange={(e) => setIncTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Category</label>
                <select
                  value={incCategory}
                  onChange={(e) => setIncCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                >
                  <option value="Sales">Sales</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Sponsorship">Sponsorship</option>
                  <option value="Affiliate">Affiliate</option>
                  <option value="Events">Events</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={incAmount}
                  onChange={(e) => setIncAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none font-bold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Date</label>
                <input
                  type="date"
                  value={incDate}
                  onChange={(e) => setIncDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g. REV-2026-99"
                  value={incRef}
                  onChange={(e) => setIncRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Payment Method</label>
                <select
                  value={incMethod}
                  onChange={(e) => setIncMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                >
                  <option value="ABA PayWay">ABA PayWay</option>
                  <option value="KHQR / Bakong">KHQR / Bakong</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Deposit Account</label>
                <select
                  value={incAccount}
                  onChange={(e) => setIncAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                >
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.accountName}>
                      {a.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Audit Notes</label>
              <textarea
                rows={2}
                value={incNotes}
                onChange={(e) => setIncNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Expense Modal */}
      {(isAddExpenseOpen || editingExpense) && (
        <Modal
          isOpen={isAddExpenseOpen || Boolean(editingExpense)}
          onClose={() => {
            setIsAddExpenseOpen(false);
            setEditingExpense(null);
          }}
          title={editingExpense ? 'Edit Expense Record' : 'Log Store Operational Expense'}
          size="md"
          footer={
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddExpenseOpen(false);
                  setEditingExpense(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveExpense}>
                {editingExpense ? 'Update Expense' : 'Log Expense'}
              </Button>
            </>
          }
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Expense Description</label>
              <input
                type="text"
                placeholder="e.g. Good Smile Figure Import Shipment"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                >
                  <option value="Inventory Import">Inventory Import</option>
                  <option value="Shipping & Logistics">Shipping & Logistics</option>
                  <option value="Marketing & Ads">Marketing & Ads</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Software & Tools">Software & Tools</option>
                  <option value="Office & Store">Office & Store</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={expAmount}
                  onChange={(e) => setExpAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none font-bold text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-text-primary mb-1">Date</label>
                <input
                  type="date"
                  value={expDate}
                  onChange={(e) => setExpDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-primary mb-1">Disbursement Bank</label>
                <select
                  value={expAccount}
                  onChange={(e) => setExpAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                >
                  {financialAccounts.map((a) => (
                    <option key={a.id} value={a.accountName}>
                      {a.accountName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Receipt Attachment URL (optional)</label>
              <input
                type="text"
                placeholder="https://storage.example.com/receipts/inv.pdf"
                value={expReceipt}
                onChange={(e) => setExpReceipt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-text-primary mb-1">Notes</label>
              <textarea
                rows={2}
                value={expNotes}
                onChange={(e) => setExpNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border focus:ring-1 focus:ring-primary focus:outline-none text-xs"
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
