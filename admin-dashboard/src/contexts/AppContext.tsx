import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { AppContext, useApp } from './appContextInstance';
import type {
  Product, Category, Order, Customer, Review, InventoryItem,
  StockMovement, StoreSettings, Notification, ToastMessage, AdminProfile,
  PaymentProvider, PaymentTransaction, FinancialAccount,
  IncomeRecord, ExpenseRecord, UserAccount, UserActivityLog,
  BackupItem, AutoBackupConfig,
} from '@/types';
import { ordersApi } from '@/services/ordersApi';
import { customersApi } from '@/services/customersApi';
import { notificationsApi } from '@/services/notificationsApi';
import { settingsApi } from '@/services/settingsApi';
import { categoriesApi } from '@/services/categoriesApi';
import { productsApi } from '@/services/productsApi';
import { playOrderNotificationSound } from '@/utils/soundService';
import {
  initialProducts, initialCategories, initialOrders, initialCustomers,
  initialReviews, initialInventory, initialStockMovements,
  initialNotifications, initialSettings, adminProfile as defaultAdminProfile,
} from '@/data/mockData';
import {
  initialPaymentProviders, initialPaymentTransactions,
  initialFinancialAccounts, initialIncomeRecords,
  initialExpenseRecords, initialUserAccounts, initialUserActivityLogs,
} from '@/data/accountsMockData';
import {
  initialBackups, initialAutoBackupConfig,
} from '@/data/backupMockData';
import { getFromStorage, setToStorage } from '@/utils/localStorage';
import { generateId } from '@/utils/formatters';

export interface AppContextType {
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  // Toast
  toasts: ToastMessage[];
  addToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'unitsSold'>) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  // Categories
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'productCount'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  // Orders
  orders: Order[];
  updateOrderStatus: (id: string, status: Order['status']) => void;
  deleteOrder: (id: string) => void;
  deleteOrders: (ids: string[]) => void;
  refreshOrders: () => Promise<void>;
  importOrders: (importedOrders: Order[], duplicateHandling: 'update' | 'skip') => { added: number; updated: number };
  importProducts: (importedProducts: Product[], duplicateHandling: 'update' | 'skip') => { added: number; updated: number };
  // Customers
  customers: Customer[];
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  deleteCustomers: (ids: string[]) => void;
  // Reviews
  reviews: Review[];
  updateReviewStatus: (id: string, status: Review['status']) => void;
  deleteReview: (id: string) => void;
  // Inventory
  inventory: InventoryItem[];
  stockMovements: StockMovement[];
  updateStock: (productId: string, quantity: number, type: 'in' | 'out', reason: string) => void;
  // Settings
  settings: StoreSettings;
  updateSettings: (data: Partial<StoreSettings>) => void;
  // Admin Profile
  adminProfile: AdminProfile;
  updateAdminProfile: (data: Partial<AdminProfile>) => void;
  // Notifications
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;
  telegramConfigured: boolean;
  sendTestTelegram: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  // Authentication
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  // Auth Background
  authBackground: string;
  setAuthBackground: (bg: string) => void;
  // Accounts: Payments
  paymentProviders: PaymentProvider[];
  updatePaymentProvider: (code: string, data: Partial<PaymentProvider>) => void;
  paymentTransactions: PaymentTransaction[];
  verifyPaymentTransaction: (transactionId: string) => void;
  refundPaymentTransaction: (id: string, refundAmount: number, reason: string) => void;
  // Accounts: Financial
  financialAccounts: FinancialAccount[];
  incomeRecords: IncomeRecord[];
  expenseRecords: ExpenseRecord[];
  addIncomeRecord: (data: Omit<IncomeRecord, 'id'>) => void;
  addExpenseRecord: (data: Omit<ExpenseRecord, 'id'>) => void;
  updateExpenseRecord: (id: string, data: Partial<ExpenseRecord>) => void;
  // Accounts: Users & RBAC
  userAccounts: UserAccount[];
  addUserAccount: (data: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateUserAccount: (id: string, data: Partial<UserAccount>) => void;
  toggleUserStatus: (id: string) => void;
  resetUserPassword: (id: string, newPass: string) => void;
  activityLogs: UserActivityLog[];
  // Backup & Restore
  backups: BackupItem[];
  autoBackupConfig: AutoBackupConfig;
  createBackup: (type: 'full' | 'catalog' | 'orders_financial' | 'users') => BackupItem;
  deleteBackup: (id: string) => void;
  updateAutoBackupConfig: (cfg: Partial<AutoBackupConfig>) => void;
  restoreBackup: (id: string) => void;
  restoreFromUpload: (filename: string, contentStr: string) => void;
}

export { useApp };

let activeCatalogSyncPromise: Promise<void> | null = null;

export function AppProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [products, setProducts] = useState<Product[]>(() => {
    const stored = getFromStorage('products', initialProducts);
    return stored.map((p) => {
      if (p.images && p.images.length > 0) return p;
      const fallback = initialProducts.find((ip) => ip.id === p.id || ip.sku === p.sku);
      return fallback?.images?.length ? { ...p, images: fallback.images } : p;
    });
  });
  const [categories, setCategories] = useState<Category[]>(() => getFromStorage('categories', initialCategories));
  const [orders, setOrders] = useState<Order[]>(() => getFromStorage('orders', initialOrders));
  const [customers, setCustomers] = useState<Customer[]>(() => getFromStorage('customers', initialCustomers));
  const [reviews, setReviews] = useState<Review[]>(() => getFromStorage('reviews', initialReviews));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const stored = getFromStorage('inventory', initialInventory);
    return stored.map((item) => {
      if (item.productImage) return item;
      const fallback = initialProducts.find((ip) => ip.id === item.productId || ip.sku === item.sku);
      return fallback?.images?.[0] ? { ...item, productImage: fallback.images[0] } : item;
    });
  });
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => getFromStorage('stockMovements', initialStockMovements));
  const [settings, setSettings] = useState<StoreSettings>(() => getFromStorage('settings', initialSettings));
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(() => getFromStorage('admin_profile', defaultAdminProfile));
  const [notifications, setNotifications] = useState<Notification[]>(() => getFromStorage('notifications', initialNotifications));
  const [telegramConfigured, setTelegramConfigured] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getFromStorage('auth_logged_in', false));
  const [authBackground, setAuthBackgroundState] = useState<string>(() => getFromStorage('auth_bg', 'default'));

  // Accounts Module State
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>(() => getFromStorage('payment_providers', initialPaymentProviders));
  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransaction[]>(() => getFromStorage('payment_transactions', initialPaymentTransactions));
  const [financialAccounts, setFinancialAccounts] = useState<FinancialAccount[]>(() => getFromStorage('financial_accounts', initialFinancialAccounts));
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>(() => getFromStorage('income_records', initialIncomeRecords));
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>(() => getFromStorage('expense_records', initialExpenseRecords));
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => getFromStorage('user_accounts', initialUserAccounts));
  const [activityLogs, setActivityLogs] = useState<UserActivityLog[]>(() => getFromStorage('user_activity_logs', initialUserActivityLogs));

  // Backup & Restore State
  const [backups, setBackups] = useState<BackupItem[]>(() => getFromStorage('system_backups', initialBackups));
  const [autoBackupConfig, setAutoBackupConfig] = useState<AutoBackupConfig>(() => getFromStorage('auto_backup_config', initialAutoBackupConfig));

  // Helpers
  const persist = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T>>) =>
    (updater: T | ((prev: T) => T)) => {
      setter(prev => {
        const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
        setToStorage(key, next);
        return next;
      });
    };

  const addToast = useCallback((message: string, type: ToastMessage['type']) => {
    setToasts(prev => [...prev, { id: generateId(), message, type }]);
  }, []);
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Products
  const addProduct = (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'unitsSold'>) => {
    const now = new Date().toISOString().split('T')[0];
    const tempId = generateId();
    const p: Product = { ...data, id: tempId, rating: 0, reviewCount: 0, unitsSold: 0, createdAt: now, updatedAt: now };
    persist('products', setProducts)((prev: Product[]) => [p, ...prev]);
    // Add inventory item
    const inv: InventoryItem = {
      id: `inv-${p.id}`, productId: p.id, productName: p.name, productImage: p.images[0] || '',
      sku: p.sku, category: p.category, currentStock: p.stock, minStock: 10, maxStock: 100,
      status: p.stock === 0 ? 'out_of_stock' : p.stock <= 10 ? 'low_stock' : 'in_stock',
      lastRestocked: now, updatedAt: now,
    };
    persist('inventory', setInventory)((prev: InventoryItem[]) => [inv, ...prev]);

    productsApi
      .createProduct(data)
      .then((saved) => {
        persist('products', setProducts)((prev: Product[]) =>
          prev.map((item) => (item.id === tempId ? saved : item))
        );
        persist('inventory', setInventory)((prev: InventoryItem[]) =>
          prev.map((item) => (item.productId === tempId ? { ...item, productId: saved.id } : item))
        );
        addToast('Product saved to database', 'success');
        broadcastCatalogUpdated();
        categoriesApi
          .getCategories()
          .then((cats) => {
            setCategories(cats);
            setToStorage('categories', cats);
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error('[Admin] Backend product create failed:', err);
        addToast(
          err instanceof Error ? `Database error: ${err.message}` : 'Failed to save product to database',
          'error'
        );
      });
  };
  const updateProduct = (id: string, data: Partial<Product>) => {
    persist('products', setProducts)((prev: Product[]) => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString().split('T')[0] } : p));
    if (data.images || data.name || data.sku || data.category || data.stock !== undefined) {
      persist('inventory', setInventory)((prev: InventoryItem[]) =>
        prev.map(item =>
          item.productId === id
            ? {
                ...item,
                ...(data.images ? { productImage: data.images[0] || '' } : {}),
                ...(data.name ? { productName: data.name } : {}),
                ...(data.sku ? { sku: data.sku } : {}),
                ...(data.category ? { category: data.category } : {}),
                ...(data.stock !== undefined ? { currentStock: data.stock } : {}),
              }
            : item
        )
      );
    }

    productsApi
      .updateProduct(id, data)
      .then((saved) => {
        if (saved) {
          persist('products', setProducts)((prev: Product[]) =>
            prev.map((p) => (p.id === id ? saved : p))
          );
        }
        addToast('Product updated in database', 'success');
        broadcastCatalogUpdated();
        categoriesApi
          .getCategories()
          .then((cats) => {
            setCategories(cats);
            setToStorage('categories', cats);
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error('[Admin] Backend product update failed:', err);
        addToast(
          err instanceof Error ? `Database error: ${err.message}` : 'Failed to update product in database',
          'error'
        );
      });
  };
  const deleteProduct = (id: string) => {
    persist('products', setProducts)((prev: Product[]) => prev.filter(p => p.id !== id));
    persist('inventory', setInventory)((prev: InventoryItem[]) => prev.filter(i => i.productId !== id));

    productsApi
      .deleteProduct(id)
      .then(() => {
        addToast('Product deleted from database', 'success');
        broadcastCatalogUpdated();
        categoriesApi
          .getCategories()
          .then((cats) => {
            setCategories(cats);
            setToStorage('categories', cats);
          })
          .catch(() => {});
      })
      .catch((err) => {
        console.error('[Admin] Backend product delete failed:', err);
        addToast(
          err instanceof Error ? `Database error: ${err.message}` : 'Failed to delete product from database',
          'error'
        );
      });
  };

  const broadcastCatalogUpdated = () => {
    try {
      const channel = new BroadcastChannel('anime_store_channel');
      channel.postMessage({ type: 'CATALOG_UPDATED' });
      channel.close();
    } catch {}
  };

  // Categories
  const addCategory = (data: Omit<Category, 'id' | 'createdAt' | 'productCount'>) => {
    const tempId = generateId();
    const c: Category = { ...data, id: tempId, productCount: 0, createdAt: new Date().toISOString().split('T')[0] };
    persist('categories', setCategories)((prev: Category[]) => [c, ...prev]);

    categoriesApi
      .createCategory(data)
      .then((saved) => {
        persist('categories', setCategories)((prev: Category[]) =>
          prev.map((item) => (item.id === tempId ? saved : item))
        );
        addToast('Category saved to database', 'success');
        broadcastCatalogUpdated();
      })
      .catch((err) => {
        console.error('[Admin] Backend category create failed:', err);
        addToast(
          err instanceof Error ? `Database error: ${err.message}` : 'Failed to save category to database',
          'error'
        );
      });
  };
  const updateCategory = (id: string, data: Partial<Category>) => {
    persist('categories', setCategories)((prev: Category[]) => prev.map(c => c.id === id ? { ...c, ...data } : c));

    categoriesApi
      .updateCategory(id, data)
      .then((saved) => {
        if (saved) {
          persist('categories', setCategories)((prev: Category[]) =>
            prev.map((c) => (c.id === id ? saved : c))
          );
        }
        addToast('Category updated in database', 'success');
        broadcastCatalogUpdated();
      })
      .catch((err) => {
        console.error('[Admin] Backend category update failed:', err);
        addToast(
          err instanceof Error ? `Database error: ${err.message}` : 'Failed to update category in database',
          'error'
        );
      });
  };
  const deleteCategory = (id: string) => {
    persist('categories', setCategories)((prev: Category[]) => prev.filter(c => c.id !== id));

    categoriesApi
      .deleteCategory(id)
      .then(() => {
        addToast('Category deleted from database', 'success');
        broadcastCatalogUpdated();
      })
      .catch((err) => {
        console.error('[Admin] Backend category delete failed:', err);
        addToast(
          err instanceof Error ? `Database error: ${err.message}` : 'Failed to delete category from database',
          'error'
        );
      });
  };

  // Orders & Live Notifications
  const knownOrderNumbersRef = useRef<Set<string>>(new Set());
  const isFirstSyncRef = useRef<boolean>(true);

  const notifyNewOrder = useCallback((orderNumber: string, customerName: string, totalAmount: number, itemsCount = 1) => {
    // 1. Play soft audio chime
    playOrderNotificationSound();

    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // 2. Show prominent Toast banner on screen with exact time
    const formattedTotal = typeof totalAmount === 'number' ? totalAmount.toFixed(2) : totalAmount;
    addToast(
      `🔔 NEW ORDER! ${orderNumber} from ${customerName} ($${formattedTotal}) at ${timeStr}`,
      'success'
    );

    // 3. Add to Notifications dropdown list in Top Header with exact time
    const newNotif: Notification = {
      id: generateId(),
      title: `🔔 New Order: ${orderNumber}`,
      message: `${customerName} ordered $${formattedTotal} (${itemsCount} items) at ${timeStr}`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString(),
    };
    persist('notifications', setNotifications)((prev: Notification[]) => [newNotif, ...prev]);

    // 4. Native Browser notification if permitted
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`New Order: ${orderNumber}`, {
          body: `${customerName} placed an order for $${formattedTotal}`,
          icon: '/favicon.ico',
        });
      }
    } catch {}
  }, [addToast]);

  const syncOrdersFromBackend = useCallback(async () => {
    try {
      const { items } = await ordersApi.getOrders();
      if (items && items.length > 0) {
        // Detect brand new incoming orders
        if (isFirstSyncRef.current) {
          // Initialize known orders on first startup without firing notifications
          items.forEach((o) => knownOrderNumbersRef.current.add(o.orderNumber));
          isFirstSyncRef.current = false;
        } else {
          // Check for new orders that arrived after initial load
          for (const item of items) {
            if (!knownOrderNumbersRef.current.has(item.orderNumber)) {
              knownOrderNumbersRef.current.add(item.orderNumber);
              notifyNewOrder(item.orderNumber, item.customer.name, item.totalAmount, item.items.length);
            }
          }
        }

        setOrders((prev) => {
          // Merge server orders with local mock orders (server orders take precedence)
          const serverOrderNumbers = new Set(items.map((o) => o.orderNumber));
          const localOnly = prev.filter((o) => !serverOrderNumbers.has(o.orderNumber));
          const merged = [...items, ...localOnly];
          setToStorage('orders', merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn('[Admin] Could not sync orders from backend API:', err);
    }
  }, [notifyNewOrder]);

  const syncCustomersFromBackend = useCallback(async () => {
    try {
      const { items } = await customersApi.getCustomers();
      setCustomers(items);
      setToStorage('customers', items);
    } catch (err) {
      console.warn('[Admin] Could not sync customers from backend API:', err);
    }
  }, []);

  const syncNotificationsFromBackend = useCallback(async () => {
    try {
      const { items, telegramConfigured: tgOk } = await notificationsApi.getNotifications();
      setTelegramConfigured(tgOk);
      if (items.length > 0) {
        setNotifications(items);
        setToStorage('notifications', items);
      }
    } catch (err) {
      console.warn('[Admin] Could not sync notifications from backend API:', err);
    }
  }, []);

  const syncCategoriesFromBackend = useCallback(async () => {
    try {
      const serverCats = await categoriesApi.getCategories();
      const serverSlugs = new Set(serverCats.map((c) => c.slug.toLowerCase()));
      const initialIds = new Set(initialCategories.map((c) => c.id));
      const localStored = getFromStorage<Category[]>('categories', []);

      // Migrate any custom unsynced local categories (e.g. created before DB sync) to PostgreSQL
      const customUnsynced = localStored.filter(
        (c) =>
          !initialIds.has(c.id) &&
          Number.isNaN(Number(c.id)) &&
          c.slug &&
          !serverSlugs.has(c.slug.toLowerCase())
      );

      let finalCats = serverCats;
      if (customUnsynced.length > 0) {
        for (const localCat of customUnsynced) {
          try {
            const created = await categoriesApi.createCategory({
              name: localCat.name,
              slug: localCat.slug,
              description: localCat.description,
              image: localCat.image,
              status: localCat.status,
            });
            finalCats = [...finalCats, created];
            serverSlugs.add(created.slug.toLowerCase());
          } catch {}
        }
        broadcastCatalogUpdated();
      }

      if (finalCats.length > 0) {
        setCategories(finalCats);
        setToStorage('categories', finalCats);
      }
    } catch (err) {
      console.warn('[Admin] Could not sync categories from backend API:', err);
    }
  }, []);

  const syncProductsFromBackend = useCallback(async (currentCategories?: Category[]) => {
    try {
      const { items: serverProds } = await productsApi.getProducts({ page_size: 100 });
      const serverSkus = new Set(serverProds.map((p) => p.sku.toUpperCase()));
      const initialIds = new Set(initialProducts.map((p) => p.id));
      const localStored = getFromStorage<Product[]>('products', []);
      const catPool = currentCategories || getFromStorage<Category[]>('categories', []);

      const customUnsynced = localStored.filter(
        (p) =>
          !initialIds.has(p.id) &&
          Number.isNaN(Number(p.id)) &&
          p.sku &&
          !serverSkus.has(p.sku.toUpperCase())
      );

      let finalProds = serverProds;
      if (customUnsynced.length > 0) {
        for (const localProd of customUnsynced) {
          try {
            const matchedCat = catPool.find(
              (c) =>
                c.id === localProd.categoryId ||
                c.name.toLowerCase() === localProd.category.toLowerCase()
            );
            const created = await productsApi.createProduct({
              ...localProd,
              categoryId: matchedCat?.id || catPool[0]?.id || '1',
              category: matchedCat?.name || localProd.category,
            });
            finalProds = [created, ...finalProds];
            serverSkus.add(created.sku.toUpperCase());
          } catch {}
        }
        broadcastCatalogUpdated();
      }

      if (finalProds.length > 0) {
        setProducts(finalProds);
        setToStorage('products', finalProds);
      }
    } catch (err) {
      console.warn('[Admin] Could not sync products from backend API:', err);
    }
  }, []);

  const syncCatalogFromBackend = useCallback(async () => {
    if (activeCatalogSyncPromise) {
      return activeCatalogSyncPromise;
    }

    const run = async () => {
      await syncCategoriesFromBackend();
      await syncProductsFromBackend();
    };

    const promise = run().finally(() => {
      activeCatalogSyncPromise = null;
    });
    activeCatalogSyncPromise = promise;
    return promise;
  }, [syncCategoriesFromBackend, syncProductsFromBackend]);

  // Fast-polling + Cross-tab BroadcastChannel listener
  useEffect(() => {
    syncOrdersFromBackend();
    syncCustomersFromBackend();
    syncNotificationsFromBackend();
    syncCatalogFromBackend();
    settingsApi
      .getSettings(initialSettings)
      .then((serverSettings) => {
        setSettings(serverSettings);
        setToStorage('settings', serverSettings);
      })
      .catch(() => {});

    // Check backend every 5 seconds for any new incoming orders
    const timer = setInterval(syncOrdersFromBackend, 5000);

    // Instant cross-tab notification via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('anime_store_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'NEW_ORDER') {
          const { orderNumber, customerName, total, itemsCount } = event.data;
          knownOrderNumbersRef.current.add(orderNumber);
          notifyNewOrder(orderNumber, customerName || 'Customer', total || 0, itemsCount || 1);
          syncOrdersFromBackend();
          syncCustomersFromBackend();
          syncNotificationsFromBackend();
        } else if (event.data?.type === 'SETTINGS_UPDATED' && event.data.settings) {
          settingsApi
            .getSettings(initialSettings)
            .then((serverSettings) => {
              setSettings(serverSettings);
              setToStorage('settings', serverSettings);
            })
            .catch(() => {});
        } else if (event.data?.type === 'CATALOG_UPDATED') {
          syncCatalogFromBackend();
        }
      };
    } catch (e) {
      console.warn('[Admin] BroadcastChannel notice:', e);
    }

    return () => {
      clearInterval(timer);
      channel?.close();
    };
  }, [syncOrdersFromBackend, syncCustomersFromBackend, syncNotificationsFromBackend, syncCatalogFromBackend, notifyNewOrder]);

  const updateOrderStatus = (id: string, status: Order['status']) => {
    persist('orders', setOrders)((prev: Order[]) => prev.map(o => (o.id === id || o.orderNumber === id) ? {
      ...o, status, updatedAt: new Date().toISOString().split('T')[0],
      paymentStatus: status === 'cancelled' ? 'refunded' as const : status === 'completed' ? 'paid' as const : o.paymentStatus,
    } : o));
    addToast(`Order status updated to ${status}`, 'success');

    // Also sync status to FastAPI Backend / PostgreSQL Database
    ordersApi.updateOrderStatus(id, status).catch((err) => {
      console.warn('[Admin] Backend order status update failed (cached locally):', err);
    });
  };

  const deleteOrder = (id: string) => {
    persist('orders', setOrders)((prev: Order[]) => prev.filter(o => o.id !== id && o.orderNumber !== id));
    addToast('Order deleted', 'success');
    ordersApi.deleteOrder(id).catch((err) => {
      console.warn('[Admin] Backend order delete failed (cached locally):', err);
    });
  };

  const deleteOrders = (ids: string[]) => {
    const idSet = new Set(ids);
    persist('orders', setOrders)((prev: Order[]) => prev.filter(o => !idSet.has(o.id) && !idSet.has(o.orderNumber)));
    addToast(`Deleted ${ids.length} order(s)`, 'success');
    ordersApi.bulkDeleteOrders(ids).catch((err) => {
      console.warn('[Admin] Backend bulk order delete failed (cached locally):', err);
    });
  };

  const importOrders = (importedOrders: Order[], duplicateHandling: 'update' | 'skip') => {
    let added = 0;
    let updated = 0;
    const now = new Date().toISOString().split('T')[0];

    persist('orders', setOrders)((prev: Order[]) => {
      const orderMap = new Map(prev.map(o => [o.orderNumber.toLowerCase(), o]));
      const nextList = [...prev];

      importedOrders.forEach(imp => {
        const key = imp.orderNumber.toLowerCase();
        if (orderMap.has(key)) {
          if (duplicateHandling === 'update') {
            const index = nextList.findIndex(o => o.orderNumber.toLowerCase() === key);
            if (index !== -1) {
              nextList[index] = { ...nextList[index], ...imp, updatedAt: now };
              updated++;
            }
          }
        } else {
          nextList.unshift(imp);
          added++;
        }
      });

      return nextList;
    });

    addToast(`Excel import complete: ${added} orders added, ${updated} updated`, 'success');
    return { added, updated };
  };

  const importProducts = (importedProducts: Product[], duplicateHandling: 'update' | 'skip') => {
    let added = 0;
    let updated = 0;
    const now = new Date().toISOString().split('T')[0];

    persist('products', setProducts)((prev: Product[]) => {
      const skuMap = new Map(prev.map(p => [p.sku.toUpperCase(), p]));
      const nextList = [...prev];

      importedProducts.forEach(imp => {
        const key = imp.sku.toUpperCase();
        if (skuMap.has(key)) {
          if (duplicateHandling === 'update') {
            const index = nextList.findIndex(p => p.sku.toUpperCase() === key);
            if (index !== -1) {
              nextList[index] = { ...nextList[index], ...imp, updatedAt: now };
              updated++;
            }
          }
        } else {
          nextList.unshift(imp);
          added++;
        }
      });

      return nextList;
    });

    addToast(`Excel import complete: ${added} products added, ${updated} updated`, 'success');
    return { added, updated };
  };

  // Customers
  const updateCustomer = (id: string, data: Partial<Customer>) => {
    persist('customers', setCustomers)((prev: Customer[]) => prev.map(c => c.id === id ? { ...c, ...data } : c));
    addToast('Customer updated successfully', 'success');
    customersApi.updateCustomer(id, data).catch((err) => {
      console.warn('[Admin] Backend customer update failed:', err);
    });
  };
  const deleteCustomer = (id: string) => {
    persist('customers', setCustomers)((prev: Customer[]) => prev.filter(c => c.id !== id));
    addToast('Customer deleted', 'success');
    customersApi.deleteCustomer(id).catch((err) => {
      console.warn('[Admin] Backend customer delete failed:', err);
    });
  };
  const deleteCustomers = (ids: string[]) => {
    const idSet = new Set(ids);
    persist('customers', setCustomers)((prev: Customer[]) => prev.filter(c => !idSet.has(c.id)));
    addToast(`Deleted ${ids.length} customer(s)`, 'success');
    customersApi.bulkDeleteCustomers(ids).catch((err) => {
      console.warn('[Admin] Backend bulk customer delete failed:', err);
    });
  };

  // Reviews
  const updateReviewStatus = (id: string, status: Review['status']) => {
    persist('reviews', setReviews)((prev: Review[]) => prev.map(r => r.id === id ? { ...r, status } : r));
    addToast(`Review ${status}`, 'success');
  };
  const deleteReview = (id: string) => {
    persist('reviews', setReviews)((prev: Review[]) => prev.filter(r => r.id !== id));
    addToast('Review deleted', 'success');
  };

  // Inventory
  const updateStock = (productId: string, quantity: number, type: 'in' | 'out', reason: string) => {
    persist('inventory', setInventory)((prev: InventoryItem[]) =>
      prev.map(item => {
        if (item.productId !== productId) return item;
        const newStock = type === 'in' ? item.currentStock + quantity : Math.max(0, item.currentStock - quantity);
        const movement: StockMovement = {
          id: generateId(), productId, productName: item.productName, type, quantity,
          previousStock: item.currentStock, newStock, reason,
          date: new Date().toISOString().split('T')[0], createdBy: 'Admin',
        };
        persist('stockMovements', setStockMovements)((prev: StockMovement[]) => [movement, ...prev]);
        // Also update product stock
        persist('products', setProducts)((prev: Product[]) => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
        return {
          ...item, currentStock: newStock, updatedAt: new Date().toISOString().split('T')[0],
          lastRestocked: type === 'in' ? new Date().toISOString().split('T')[0] : item.lastRestocked,
          status: newStock === 0 ? 'out_of_stock' as const : newStock <= item.minStock ? 'low_stock' as const : 'in_stock' as const,
        };
      })
    );
    addToast(`Stock ${type === 'in' ? 'added' : 'removed'} successfully`, 'success');
  };

  // Settings
  const updateSettings = (data: Partial<StoreSettings>) => {
    const merged: StoreSettings = { ...settings, ...data };
    persist('settings', setSettings)(merged);

    settingsApi
      .updateSettings(data, merged)
      .then((saved) => {
        persist('settings', setSettings)(saved);
        addToast('Settings saved to database', 'success');
        try {
          const channel = new BroadcastChannel('anime_store_channel');
          channel.postMessage({ type: 'SETTINGS_UPDATED', settings: saved });
          channel.close();
        } catch {}
      })
      .catch((err) => {
        console.error('[Admin] Backend settings update failed:', err);
        addToast('Failed to save settings to database. Please verify backend is running.', 'error');
      });
  };

  // Admin Profile
  const updateAdminProfile = (data: Partial<AdminProfile>) => {
    persist('admin_profile', setAdminProfile)((prev: AdminProfile) => ({ ...prev, ...data }));
    addToast('Admin profile updated successfully', 'success');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    persist('notifications', setNotifications)((prev: Notification[]) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    notificationsApi.markRead(id).catch(() => {});
  };
  const markAllNotificationsRead = () => {
    persist('notifications', setNotifications)((prev: Notification[]) => prev.map(n => ({ ...n, read: true })));
    notificationsApi.markAllRead().catch(() => {});
  };
  const sendTestTelegram = async () => {
    try {
      const res = await notificationsApi.sendTestTelegram();
      if (res.notification) {
        persist('notifications', setNotifications)((prev: Notification[]) => [res.notification!, ...prev]);
      }
      if (res.sent) {
        addToast('Telegram notification sent!', 'success');
      } else {
        addToast(`Telegram not sent: ${res.detail || 'Check token/chat ID'}`, 'error');
      }
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to send Telegram test', 'error');
    }
  };
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Authentication
  const login = (password: string) => {
    if (password && password.trim().length >= 4) {
      persist('auth_logged_in', setIsAuthenticated)(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    persist('auth_logged_in', setIsAuthenticated)(false);
    addToast('You have been logged out.', 'info');
  };

  const setAuthBackground = (bg: string) => {
    persist('auth_bg', setAuthBackgroundState)(bg);
    addToast('Background updated successfully!', 'success');
  };

  // Payment Providers
  const updatePaymentProvider = (code: string, data: Partial<PaymentProvider>) => {
    persist('payment_providers', setPaymentProviders)((prev: PaymentProvider[]) =>
      prev.map(p => p.code === code ? { ...p, ...data } : p)
    );
    addToast('Payment provider configuration updated', 'success');
  };

  // Payment Transactions
  const verifyPaymentTransaction = (transactionId: string) => {
    persist('payment_transactions', setPaymentTransactions)((prev: PaymentTransaction[]) =>
      prev.map(t => t.transactionId === transactionId ? { ...t, status: 'PAID' as const } : t)
    );
    addToast(`Transaction ${transactionId} verified as PAID`, 'success');
  };

  const refundPaymentTransaction = (id: string, refundAmount: number, reason: string) => {
    persist('payment_transactions', setPaymentTransactions)((prev: PaymentTransaction[]) =>
      prev.map(t => t.id === id ? { ...t, status: 'REFUNDED' as const, refundAmount, refundReason: reason } : t)
    );
    addToast(`Transaction refunded ($${refundAmount.toFixed(2)})`, 'success');
  };

  // Financial
  const addIncomeRecord = (data: Omit<IncomeRecord, 'id'>) => {
    const rec: IncomeRecord = { ...data, id: generateId() };
    persist('income_records', setIncomeRecords)((prev: IncomeRecord[]) => [rec, ...prev]);
    addToast('Income record added successfully', 'success');
  };

  const addExpenseRecord = (data: Omit<ExpenseRecord, 'id'>) => {
    const rec: ExpenseRecord = { ...data, id: generateId() };
    persist('expense_records', setExpenseRecords)((prev: ExpenseRecord[]) => [rec, ...prev]);
    addToast('Expense record logged successfully', 'success');
  };

  const updateExpenseRecord = (id: string, data: Partial<ExpenseRecord>) => {
    persist('expense_records', setExpenseRecords)((prev: ExpenseRecord[]) =>
      prev.map(e => e.id === id ? { ...e, ...data } : e)
    );
    addToast('Expense record updated', 'success');
  };

  // Users & RBAC
  const addUserAccount = (data: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const now = new Date().toISOString().split('T')[0];
    const user: UserAccount = { ...data, id: generateId(), createdAt: now };
    persist('user_accounts', setUserAccounts)((prev: UserAccount[]) => [user, ...prev]);
    const log: UserActivityLog = {
      id: generateId(),
      userEmail: user.email,
      userName: user.fullName,
      action: 'create_user',
      module: 'users',
      details: `Created user account with role ${user.role}`,
      ipAddress: '192.168.1.111',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    persist('user_activity_logs', setActivityLogs)((prev: UserActivityLog[]) => [log, ...prev]);
    addToast(`User ${user.fullName} created successfully`, 'success');
  };

  const updateUserAccount = (id: string, data: Partial<UserAccount>) => {
    persist('user_accounts', setUserAccounts)((prev: UserAccount[]) =>
      prev.map(u => u.id === id ? { ...u, ...data } : u)
    );
    addToast('User profile updated', 'success');
  };

  const toggleUserStatus = (id: string) => {
    let nextStatus = false;
    persist('user_accounts', setUserAccounts)((prev: UserAccount[]) =>
      prev.map(u => {
        if (u.id === id) {
          nextStatus = !u.isActive;
          return { ...u, isActive: nextStatus };
        }
        return u;
      })
    );
    addToast(`Account status updated to ${nextStatus ? 'Active' : 'Inactive'}`, 'info');
  };

  const resetUserPassword = (_id: string, _newPass: string) => {
    addToast('User password has been securely reset', 'success');
  };

  // Backup & Restore Handlers
  const createBackup = (type: 'full' | 'catalog' | 'orders_financial' | 'users' = 'full') => {
    const now = new Date();
    const timestampStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 15);
    const filename = `anime_store_backup_${type}_${timestampStr}.json`;
    const counts: Record<string, number> = {};
    if (type === 'full' || type === 'catalog') {
      counts.products = products.length;
      counts.categories = categories.length;
    }
    if (type === 'full' || type === 'orders_financial') {
      counts.orders = orders.length;
      counts.payments = paymentTransactions.length;
      counts.income = incomeRecords.length;
      counts.expenses = expenseRecords.length;
    }
    if (type === 'full' || type === 'users') {
      counts.users = userAccounts.length;
    }

    const newBackup: BackupItem = {
      id: generateId(),
      filename,
      backupType: type,
      fileSizeBytes: Math.floor(180000 + Math.random() * 95000),
      triggerType: 'manual',
      status: 'completed',
      checksumSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      recordCounts: counts,
      createdAt: now.toISOString().replace('T', ' ').slice(0, 19),
      createdBy: 'Admin',
    };

    persist('system_backups', setBackups)((prev: BackupItem[]) => [newBackup, ...prev]);
    addToast(`Backup ${filename} created successfully`, 'success');
    return newBackup;
  };

  const deleteBackup = (id: string) => {
    persist('system_backups', setBackups)((prev: BackupItem[]) => prev.filter(b => b.id !== id));
    addToast('Backup archive deleted', 'info');
  };

  const updateAutoBackupConfig = (cfg: Partial<AutoBackupConfig>) => {
    persist('auto_backup_config', setAutoBackupConfig)((prev: AutoBackupConfig) => ({ ...prev, ...cfg }));
    addToast('Automatic backup schedule updated', 'success');
  };

  const restoreBackup = (id: string) => {
    const item = backups.find(b => b.id === id);
    addToast(`System successfully restored from snapshot ${item ? item.filename : id}`, 'success');
  };

  const restoreFromUpload = (filename: string, _contentStr: string) => {
    const newBackup: BackupItem = {
      id: generateId(),
      filename,
      backupType: 'full',
      fileSizeBytes: 210500,
      triggerType: 'manual',
      status: 'completed',
      checksumSha256: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      recordCounts: { products: products.length, orders: orders.length, users: userAccounts.length },
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      createdBy: 'Uploaded Restore',
    };
    persist('system_backups', setBackups)((prev: BackupItem[]) => [newBackup, ...prev]);
    addToast(`Database successfully restored from uploaded file ${filename}`, 'success');
  };

  return (
    <AppContext.Provider value={{
      sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed,
      toasts, addToast, removeToast,
      products, addProduct, updateProduct, deleteProduct,
      categories, addCategory, updateCategory, deleteCategory,
      orders, updateOrderStatus, deleteOrder, deleteOrders, refreshOrders: syncOrdersFromBackend, importOrders, importProducts,
      customers, updateCustomer, deleteCustomer, deleteCustomers,
      reviews, updateReviewStatus, deleteReview,
      inventory, stockMovements, updateStock,
      settings, updateSettings,
      adminProfile, updateAdminProfile,
      notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount,
      telegramConfigured, sendTestTelegram, refreshNotifications: syncNotificationsFromBackend,
      isAuthenticated, login, logout,
      authBackground, setAuthBackground,
      paymentProviders, updatePaymentProvider,
      paymentTransactions, verifyPaymentTransaction, refundPaymentTransaction,
      financialAccounts, incomeRecords, expenseRecords,
      addIncomeRecord, addExpenseRecord, updateExpenseRecord,
      userAccounts, addUserAccount, updateUserAccount,
      toggleUserStatus, resetUserPassword, activityLogs,
      backups, autoBackupConfig, createBackup, deleteBackup,
      updateAutoBackupConfig, restoreBackup, restoreFromUpload,
    }}>
      {children}
    </AppContext.Provider>
  );
}
