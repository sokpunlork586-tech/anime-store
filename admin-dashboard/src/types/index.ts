// ==================== DATA MODELS ====================

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  categoryId: string;
  sku: string;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  images: string[];
  rating: number;
  reviewCount: number;
  unitsSold: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  totalAmount: number;
  status: 'completed' | 'processing' | 'pending' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  paymentMethod?: string;
  shippingAddress: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrderAt: string;
  status: 'active' | 'inactive';
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  title: string;
  comment: string;
  status: 'approved' | 'pending' | 'hidden';
  helpful: number;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastRestocked: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'in' | 'out';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  date: string;
  createdBy: string;
}

export interface StoreSettings {
  storeName: string;
  storeDescription: string;
  storeLogo: string;
  storeTagline?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
  };
  shipping: {
    freeShippingThreshold: number;
    standardRate: number;
    expressRate: number;
    estimatedDays: { standard: string; express: string };
  };
  currency: string;
  currencySymbol: string;
  taxRate: number;
}

// ==================== DASHBOARD ====================

export interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  totalRevenue: number;
  orderGrowth: number;
  productGrowth: number;
  customerGrowth: number;
  revenueGrowth: number;
}

export interface SalesDataPoint {
  day: string;
  thisMonth: number;
  lastMonth: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

// ==================== UI ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'review' | 'inventory' | 'system';
  read: boolean;
  createdAt: string;
}

export interface AdminProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  bio?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface SelectOption {
  value: string;
  label: string;
}

// ==================== ACCOUNTS MANAGEMENT ====================

export interface PaymentProvider {
  id: string;
  name: string;
  code: 'aba_payway' | 'khqr_bakong' | 'acleda';
  description: string;
  isEnabled: boolean;
  isSandbox: boolean;
  merchantId: string;
  apiKeyMasked: string;
  webhookSecretMasked: string;
  currency: 'USD' | 'KHR';
  logoUrl?: string;
  supportedMethods: string[];
}

export interface PaymentTransaction {
  id: string;
  transactionId: string;
  orderNumber: string;
  providerCode: 'aba_payway' | 'khqr_bakong' | 'acleda';
  amount: number;
  currency: 'USD' | 'KHR';
  status: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED';
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  notes?: string;
  createdAt: string;
  refundAmount?: number;
  refundReason?: string;
}

export interface FinancialAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings' | 'settlement';
  balance: number;
  currency: 'USD' | 'KHR';
  isActive: boolean;
  notes?: string;
}

export interface IncomeRecord {
  id: string;
  title: string;
  category: 'Sales' | 'Wholesale' | 'Sponsorship' | 'Affiliate' | 'Events' | 'Other';
  amount: number;
  currency: 'USD' | 'KHR';
  date: string;
  referenceNumber: string;
  paymentMethod: string;
  accountName: string;
  notes?: string;
  createdBy: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  category: 'Inventory Import' | 'Shipping & Logistics' | 'Marketing & Ads' | 'Payroll' | 'Utilities' | 'Software & Tools' | 'Office & Store' | 'Other';
  amount: number;
  currency: 'USD' | 'KHR';
  date: string;
  paymentMethod: string;
  accountName: string;
  receiptUrl?: string;
  notes?: string;
  createdBy: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  availableBalance: number;
  pendingPayments: number;
  totalTransactions: number;
  currency: string;
}

export interface UserAccount {
  id: string;
  email: string;
  fullName: string;
  role: 'super_admin' | 'admin' | 'staff' | 'customer';
  phone?: string;
  address?: string;
  city?: string;
  isActive: boolean;
  clubMember?: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions?: string[];
}

export interface RoleInfo {
  id: string;
  name: 'super_admin' | 'admin' | 'staff' | 'customer';
  displayName: string;
  description: string;
}

export interface PermissionInfo {
  id: string;
  code: string;
  name: string;
  module: 'payments' | 'financial' | 'users' | 'products' | 'orders';
  description: string;
}

export interface UserActivityLog {
  id: string;
  userId?: string;
  userEmail: string;
  userName: string;
  action: string;
  module: 'auth' | 'payments' | 'financial' | 'users';
  details: string;
  ipAddress: string;
  createdAt: string;
}

// ==================== BACKUP & RESTORE ====================

export interface BackupItem {
  id: string;
  filename: string;
  backupType: 'full' | 'catalog' | 'orders_financial' | 'users';
  fileSizeBytes: number;
  triggerType: 'automatic' | 'manual';
  status: 'completed' | 'failed' | 'in_progress';
  checksumSha256: string;
  recordCounts: Record<string, number>;
  createdAt: string;
  createdBy: string;
}

export interface AutoBackupConfig {
  isEnabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  backupTime: string;
  retentionDays: number;
  storageTarget: string;
  lastRunAt?: string;
  nextRunAt?: string;
}
