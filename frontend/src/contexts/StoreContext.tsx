import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import {
  CartItem,
  Category,
  Customer,
  Order,
  OrderStatus,
  Product,
  ProductReview,
  StoreSettings,
  ToastMessage,
  UserSession,
} from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { mapBackendProduct } from '../services/product.service';
import { generateId, slugify } from '../utils/format';

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  figures: '/images/products/prod_ninja_figure_1795162308489.jpg',
  manga: '/images/products/prod_manga_collection_1795162321332.jpg',
  posters: '/images/products/prod_wall_scroll_1795162312280.jpg',
  accessories: '/images/products/prod_accessories_pack_1795162343404.jpg',
  apparel: '/images/products/prod_hoodie_streetwear_1795178529403.jpg',
  clothing: '/images/products/prod_hoodie_streetwear_1795178529403.jpg',
  collectibles: '/images/products/prod_collectible_lamp_1795178524570.jpg',
  plush: '/images/products/prod_forest_plush_1795162309765.jpg',
  keychains: '/images/products/prod_keychain_charm_1795178526696.jpg',
};

function resolveCategoryFallbackImage(slug: string, shortName: string): string {
  const haystack = `${slug} ${shortName}`.toLowerCase();
  for (const [key, img] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (haystack.includes(key)) return img;
  }
  return '/images/products/prod_warrior_figure_1795162308415.jpg';
}

interface PlaceOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  paymentMethod: Order['paymentMethod'];
  discount: number;
  notes?: string;
}

interface StoreContextValue {
  // Catalog
  products: Product[];
  categories: Category[];
  addProduct: (data: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'reviewCount'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateStock: (productId: string, newStock: number) => void;
  addReview: (productId: string, review: Omit<ProductReview, 'id' | 'date' | 'verified'>) => void;

  addCategory: (data: Omit<Category, 'id' | 'slug'>) => Category;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  addToCart: (productId: string, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;

  // Wishlist
  wishlist: string[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => void;
  clearWishlist: () => void;

  // Orders
  orders: Order[];
  placeOrder: (input: PlaceOrderInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  deleteOrders: (orderIds: string[]) => void;

  // Customers & Auth
  customers: Customer[];
  currentUser: UserSession | null;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: UserSession };
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => { ok: boolean; error?: string; user?: UserSession };
  logout: () => void;
  updateProfile: (updates: Partial<UserSession>) => void;
  addCustomer: (data: Omit<Customer, 'id' | 'joinedAt' | 'ordersCount' | 'totalSpent'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  deleteCustomers: (ids: string[]) => void;

  // Settings
  settings: StoreSettings;
  updateSettings: (updates: Partial<StoreSettings>) => void;

  // Notifications
  toasts: ToastMessage[];
  showToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: string) => void;
}

const globalForStore = globalThis as unknown as {
  __ANIME_STORE_CONTEXT__?: React.Context<StoreContextValue | undefined>;
};

const StoreContext =
  globalForStore.__ANIME_STORE_CONTEXT__ ??
  (globalForStore.__ANIME_STORE_CONTEXT__ = createContext<StoreContextValue | undefined>(undefined));

const STORAGE_VERSION = 'v3';
const CATALOG_VERSION = 'v4';
const EMPTY_PRODUCTS: Product[] = [];
const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_CART: CartItem[] = [];
const EMPTY_WISHLIST: string[] = [];
const EMPTY_ORDERS: Order[] = [];
const EMPTY_CUSTOMERS: Customer[] = [];
const INITIAL_EMPTY_SETTINGS: StoreSettings = {
  storeName: '',
  tagline: '',
  announcementText: '',
  promoBannerTitle: '',
  promoBannerSubtitle: '',
  heroBannerImage: '',
  promoBannerImage: '',
  clubBannerImage: '',
  phone: '',
  email: '',
  address: '',
  freeShippingThreshold: 0,
  standardShippingFee: 0,
  clubDiscountPercent: 0,
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useLocalStorage<Product[]>(`anime_store_products_${CATALOG_VERSION}`, EMPTY_PRODUCTS);
  const [categories, setCategories] = useLocalStorage<Category[]>(
    `anime_store_categories_${CATALOG_VERSION}`,
    EMPTY_CATEGORIES
  );

  useEffect(() => {
    try {
      window.localStorage.removeItem('anime_store_products_v1');
      window.localStorage.removeItem('anime_store_products_v2');
      window.localStorage.removeItem('anime_store_products_v3');
      window.localStorage.removeItem('anime_store_categories_v1');
      window.localStorage.removeItem('anime_store_categories_v2');
      window.localStorage.removeItem('anime_store_categories_v3');
      window.localStorage.removeItem('anime_store_cart_v1');
      window.localStorage.removeItem('anime_store_wishlist_v1');
      window.localStorage.removeItem('anime_store_orders_v1');
      window.localStorage.removeItem('anime_store_customers_v1');
      window.localStorage.removeItem('anime_store_user_v1');
      window.localStorage.removeItem('anime_store_settings_v1');
      window.localStorage.removeItem('anime_store_settings_v2');
    } catch {
      // Ignore storage restrictions
    }
  }, []);
  const [cart, setCart] = useLocalStorage<CartItem[]>(`anime_store_cart_${STORAGE_VERSION}`, EMPTY_CART);
  const [wishlist, setWishlist] = useLocalStorage<string[]>(`anime_store_wishlist_${STORAGE_VERSION}`, EMPTY_WISHLIST);
  const [orders, setOrders] = useLocalStorage<Order[]>(`anime_store_orders_${STORAGE_VERSION}`, EMPTY_ORDERS);
  const [customers, setCustomers] = useLocalStorage<Customer[]>(
    `anime_store_customers_${STORAGE_VERSION}`,
    EMPTY_CUSTOMERS
  );

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    fetch(`${API_URL}/customers?page_size=200`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          const mapped: Customer[] = data.items.map((c: any) => ({
            id: String(c.id),
            name: c.name || '',
            email: c.email || '',
            phone: c.phone || '',
            address: c.address || '',
            city: c.city || '',
            role: 'customer',
            clubMember: Boolean(c.club_member),
            joinedAt: (c.joined_at || c.created_at || new Date().toISOString()).split('T')[0],
            ordersCount: Number(c.total_orders ?? 0),
            totalSpent: Number(c.total_spent ?? 0),
          }));
          setCustomers(mapped);
        }
      })
      .catch(() => {
        // Keep cached state if backend is unreachable
      });

    fetch(`${API_URL}/orders?page_size=100`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items)) {
          const mappedOrders: Order[] = data.items.map((o: any) => ({
            id: o.order_number || String(o.id),
            customerId: String(o.user_id || o.customer_email || ''),
            customerName: o.customer_name || '',
            customerEmail: o.customer_email || '',
            customerPhone: o.customer_phone || '',
            shippingAddress: o.shipping_address || '',
            city: o.city || '',
            paymentMethod: (o.payment_method as Order['paymentMethod']) || 'Cash on Delivery',
            items: Array.isArray(o.items)
              ? o.items.map((i: any) => ({
                  productId: String(i.product_id ?? ''),
                  name: i.product_name || '',
                  series: i.series || '',
                  image: i.image_url || '',
                  price: Number(i.price ?? 0),
                  quantity: Number(i.quantity ?? 1),
                  variant: i.variant || undefined,
                }))
              : [],
            subtotal: Number(o.subtotal ?? 0),
            shippingFee: Number(o.shipping_fee ?? 0),
            discount: Number(o.discount ?? 0),
            total: Number(o.total_amount ?? 0),
            status: (o.status as OrderStatus) || 'Pending',
            createdAt: o.created_at || new Date().toISOString(),
            notes: o.notes || undefined,
          }));
          setOrders(mappedOrders);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [currentUser, setCurrentUser] = useLocalStorage<UserSession | null>(
    `anime_store_user_${STORAGE_VERSION}`,
    null
  );
  const [settings, setSettings] = useLocalStorage<StoreSettings>(
    `anime_store_settings_${STORAGE_VERSION}`,
    INITIAL_EMPTY_SETTINGS
  );

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
    const syncSettings = () => {
      fetch(`${API_URL}/settings`)
        .then((res) => (res.ok ? res.json() : null))
        .then((b) => {
          if (!b) return;
          const addressParts = [b.address, b.city].filter(Boolean).join(', ');
          setSettings((prev) => ({
            ...prev,
            storeName: b.store_name ?? prev.storeName,
            tagline: b.store_tagline ?? prev.tagline,
            announcementText: b.announcement_text ?? prev.announcementText,
            promoBannerTitle: b.promo_banner_title ?? prev.promoBannerTitle,
            promoBannerSubtitle: b.promo_banner_subtitle ?? prev.promoBannerSubtitle,
            heroBannerImage: b.hero_banner_image ?? prev.heroBannerImage,
            promoBannerImage: b.promo_banner_image ?? prev.promoBannerImage,
            clubBannerImage: b.club_banner_image ?? prev.clubBannerImage,
            phone: b.phone ?? prev.phone,
            email: b.email ?? prev.email,
            address: addressParts || prev.address,
            freeShippingThreshold:
              b.free_shipping_threshold !== undefined
                ? Number(b.free_shipping_threshold)
                : prev.freeShippingThreshold,
            standardShippingFee:
              b.standard_rate !== undefined ? Number(b.standard_rate) : prev.standardShippingFee,
            clubDiscountPercent:
              b.club_discount_percent !== undefined
                ? Number(b.club_discount_percent)
                : prev.clubDiscountPercent,
          }));
        })
        .catch(() => {});
    };

    const syncCatalog = () => {
      fetch(`${API_URL}/categories`)
        .then((res) => (res.ok ? res.json() : null))
        .then((catData) => {
          if (Array.isArray(catData)) {
            const mappedCats: Category[] = catData
              .filter((c: any) => !c.status || c.status === 'active')
              .map((c: any) => ({
                id: String(c.id),
                slug: c.slug || slugify(c.name || ''),
                name: c.name || '',
                shortName: c.short_name || (c.name || '').split(' ')[0],
                description: c.description || '',
                image:
                  c.image ||
                  resolveCategoryFallbackImage(c.slug || '', c.short_name || c.name || ''),
                iconKey: c.icon_key || 'Package',
                accentBg: c.accent_bg || '#F9E5CD',
              }));
            setCategories(mappedCats);
          }
        })
        .catch(() => {});

      fetch(`${API_URL}/products?page_size=100`)
        .then((res) => (res.ok ? res.json() : null))
        .then((prodData) => {
          if (prodData && Array.isArray(prodData.items)) {
            const mappedProds: Product[] = prodData.items
              .filter((p: any) => !p.status || p.status === 'active')
              .map(mapBackendProduct);
            setProducts(mappedProds);
          }
        })
        .catch(() => {});
    };

    syncSettings();
    syncCatalog();
    const timer = window.setInterval(() => {
      syncSettings();
      syncCatalog();
    }, 5000);
    window.addEventListener('focus', syncSettings);
    window.addEventListener('focus', syncCatalog);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('anime_store_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'SETTINGS_UPDATED') {
          syncSettings();
        } else if (event.data?.type === 'CATALOG_UPDATED') {
          syncCatalog();
        }
      };
    } catch {}

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', syncSettings);
      window.removeEventListener('focus', syncCatalog);
      channel?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3200);
    },
    []
  );

  // Product CRUD
  const addProduct = useCallback(
    (data: Omit<Product, 'id' | 'createdAt' | 'reviews' | 'reviewCount'>): Product => {
      const tempId = `prod-${slugify(data.name)}-${Date.now().toString().slice(-4)}`;
      const newProduct: Product = {
        ...data,
        id: tempId,
        createdAt: new Date().toISOString().split('T')[0],
        reviews: [],
        reviewCount: 0,
      };
      setProducts((prev) => [newProduct, ...prev]);

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      const numericCatId = Number(data.categoryId);
      fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: data.sku,
          name: data.name,
          slug: `${slugify(data.name)}-${Date.now().toString().slice(-4)}`,
          series: data.series || '',
          category_id: Number.isNaN(numericCatId) ? 1 : numericCatId,
          price: data.price,
          original_price: data.originalPrice ?? null,
          rating: data.rating ?? 0,
          stock_quantity: data.stock ?? 0,
          image_url: data.image || '',
          images: data.gallery?.length ? data.gallery : data.image ? [data.image] : [],
          badge: data.badge || null,
          featured: Boolean(data.featured),
          is_new_arrival: Boolean(data.isNewArrival),
          status: 'active',
          description: data.description || '',
          specifications: data.specifications || {},
          variants: data.variants || [],
          tags: data.tags || [],
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((saved) => {
          if (saved?.id) {
            const mapped = mapBackendProduct(saved);
            setProducts((prev) => prev.map((p) => (p.id === tempId ? mapped : p)));
            try {
              const channel = new BroadcastChannel('anime_store_channel');
              channel.postMessage({ type: 'CATALOG_UPDATED' });
              channel.close();
            } catch {}
            showToast('Product added', `${newProduct.name} saved to database.`);
          } else {
            showToast('Product added', `${newProduct.name} is now live in local cache.`);
          }
        })
        .catch(() => {
          showToast('Product added', `${newProduct.name} is now live in local cache.`);
        });

      return newProduct;
    },
    [setProducts, showToast]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const payload: Record<string, unknown> = {};
        if (updates.name !== undefined) payload.name = updates.name;
        if (updates.sku !== undefined) payload.sku = updates.sku;
        if (updates.series !== undefined) payload.series = updates.series;
        if (updates.categoryId !== undefined && !Number.isNaN(Number(updates.categoryId))) {
          payload.category_id = Number(updates.categoryId);
        }
        if (updates.price !== undefined) payload.price = updates.price;
        if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice ?? null;
        if (updates.stock !== undefined) payload.stock_quantity = updates.stock;
        if (updates.image !== undefined) payload.image_url = updates.image;
        if (updates.gallery !== undefined) payload.images = updates.gallery;
        if (updates.badge !== undefined) payload.badge = updates.badge;
        if (updates.featured !== undefined) payload.featured = updates.featured;
        if (updates.isNewArrival !== undefined) payload.is_new_arrival = updates.isNewArrival;
        if (updates.description !== undefined) payload.description = updates.description;

        fetch(`${API_URL}/products/${numId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => {
            if (res.ok) {
              try {
                const channel = new BroadcastChannel('anime_store_channel');
                channel.postMessage({ type: 'CATALOG_UPDATED' });
                channel.close();
              } catch {}
            }
          })
          .catch(() => {});
      }
      showToast('Product updated', 'Catalog details have been saved.');
    },
    [setProducts, showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setCart((prev) => prev.filter((item) => item.productId !== id));
      setWishlist((prev) => prev.filter((wid) => wid !== id));
      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        fetch(`${API_URL}/products/${numId}`, { method: 'DELETE' })
          .then((res) => {
            if (res.ok) {
              try {
                const channel = new BroadcastChannel('anime_store_channel');
                channel.postMessage({ type: 'CATALOG_UPDATED' });
                channel.close();
              } catch {}
            }
          })
          .catch(() => {});
      }
      showToast('Product deleted', 'Item removed from the store catalog.', 'info');
    },
    [setProducts, setCart, setWishlist, showToast]
  );

  const updateStock = useCallback(
    (productId: string, newStock: number) => {
      const safeStock = Math.max(0, Math.floor(newStock));
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock: safeStock } : p)));
    },
    [setProducts]
  );

  const addReview = useCallback(
    (productId: string, review: Omit<ProductReview, 'id' | 'date' | 'verified'>) => {
      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== productId) return product;
          const newReview: ProductReview = {
            ...review,
            id: generateId('rev'),
            date: new Date().toISOString().split('T')[0],
            verified: true,
          };
          const updatedReviews = [newReview, ...product.reviews];
          const totalScore = product.rating * product.reviewCount + review.rating;
          const nextCount = product.reviewCount + 1;
          const nextRating = Number((totalScore / nextCount).toFixed(1));
          return {
            ...product,
            reviews: updatedReviews,
            reviewCount: nextCount,
            rating: nextRating,
          };
        })
      );
      showToast('Review submitted', 'Thank you for sharing your collector feedback.');
    },
    [setProducts, showToast]
  );

  // Category CRUD
  const addCategory = useCallback(
    (data: Omit<Category, 'id' | 'slug'>): Category => {
      const slug = slugify(data.name);
      const created: Category = {
        ...data,
        id: `cat-${slug}-${Date.now().toString().slice(-3)}`,
        slug,
      };
      setCategories((prev) => [...prev, created]);

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name.trim(),
          slug,
          short_name: data.shortName || data.name.trim().split(/\s+/)[0],
          description: data.description || '',
          image: data.image || '',
          icon_key: data.iconKey || 'Package',
          accent_bg: data.accentBg || '#FFF0E6',
          status: 'active',
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((saved) => {
          if (saved?.id) {
            setCategories((prev) =>
              prev.map((c) => (c.id === created.id ? { ...c, id: String(saved.id) } : c))
            );
            try {
              const channel = new BroadcastChannel('anime_store_channel');
              channel.postMessage({ type: 'CATALOG_UPDATED' });
              channel.close();
            } catch {}
            showToast('Category saved', `${created.name} saved to database.`);
          } else {
            showToast('Category created', `${created.name} added locally.`);
          }
        })
        .catch(() => {
          showToast('Category created', `${created.name} added locally.`);
        });

      return created;
    },
    [setCategories, showToast]
  );

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      const nextSlug = updates.name ? slugify(updates.name) : updates.slug;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                slug: nextSlug || c.slug,
              }
            : c
        )
      );
      if (updates.name) {
        setProducts((prev) => prev.map((p) => (p.categoryId === id ? { ...p, categoryName: updates.name! } : p)));
      }

      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        fetch(`${API_URL}/categories/${numId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(updates.name !== undefined ? { name: updates.name, slug: nextSlug } : {}),
            ...(updates.shortName !== undefined ? { short_name: updates.shortName } : {}),
            ...(updates.description !== undefined ? { description: updates.description } : {}),
            ...(updates.image !== undefined ? { image: updates.image } : {}),
          }),
        })
          .then((res) => {
            if (res.ok) {
              try {
                const channel = new BroadcastChannel('anime_store_channel');
                channel.postMessage({ type: 'CATALOG_UPDATED' });
                channel.close();
              } catch {}
            }
          })
          .catch(() => {});
      }
      showToast('Category updated', 'Category changes saved.');
    },
    [setCategories, setProducts, showToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        fetch(`${API_URL}/categories/${numId}`, { method: 'DELETE' })
          .then((res) => {
            if (res.ok) {
              try {
                const channel = new BroadcastChannel('anime_store_channel');
                channel.postMessage({ type: 'CATALOG_UPDATED' });
                channel.close();
              } catch {}
            }
          })
          .catch(() => {});
      }
      showToast('Category removed', 'The category has been deleted.', 'info');
    },
    [setCategories, showToast]
  );

  // Cart Actions
  const addToCart = useCallback(
    (productId: string, quantity = 1, variant?: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;
      if (product.stock <= 0) {
        showToast('Out of stock', `${product.name} is currently unavailable.`, 'error');
        return;
      }
      const chosenVariant = variant || product.variants[0];
      setCart((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.productId === productId && item.variant === chosenVariant
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          const nextQty = Math.min(product.stock, updated[existingIndex].quantity + quantity);
          updated[existingIndex] = { ...updated[existingIndex], quantity: nextQty };
          return updated;
        }
        return [...prev, { productId, quantity: Math.min(product.stock, quantity), variant: chosenVariant }];
      });
      showToast('Added to cart', `${product.name} (${quantity}×) added to your bag.`);
    },
    [products, setCart, showToast]
  );

  const removeFromCart = useCallback(
    (productId: string, variant?: string) => {
      setCart((prev) =>
        prev.filter((item) => !(item.productId === productId && (variant === undefined || item.variant === variant)))
      );
      showToast('Removed from cart', 'Item removed from your shopping bag.', 'info');
    },
    [setCart, showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number, variant?: string) => {
      const product = products.find((p) => p.id === productId);
      const maxStock = product ? product.stock : 99;
      if (quantity <= 0) {
        removeFromCart(productId, variant);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId && (variant === undefined || item.variant === variant)
            ? { ...item, quantity: Math.min(maxStock, quantity) }
            : item
        )
      );
    },
    [products, removeFromCart, setCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const product = products.find((p) => p.id === item.productId);
        return sum + (product ? product.price * item.quantity : 0);
      }, 0),
    [cart, products]
  );

  // Wishlist Actions
  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          if (product) showToast('Removed from wishlist', `${product.name} removed from favorites.`, 'info');
          return prev.filter((id) => id !== productId);
        }
        if (product) showToast('Saved to wishlist', `${product.name} added to your favorites.`);
        return [productId, ...prev];
      });
    },
    [products, setWishlist, showToast]
  );

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    showToast('Wishlist cleared', 'All saved items have been removed.', 'info');
  }, [setWishlist, showToast]);

  // Orders
  const placeOrder = useCallback(
    (input: PlaceOrderInput): Order => {
      const orderItems = cart
        .map((ci) => {
          const product = products.find((p) => p.id === ci.productId);
          return {
            productId: product?.id || ci.productId,
            name: product?.name || (ci as any).name || 'Anime Collectible',
            series: product?.series || 'Anime Series',
            image: product?.image || (ci as any).image || '',
            price: product?.price || (ci as any).price || 0,
            quantity: ci.quantity || 1,
            variant: ci.variant || '',
          };
        })
        .filter((x) => x.quantity > 0);

      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;
      const total = Math.max(0, subtotal + shippingFee - input.discount);

      const newOrder: Order = {
        id: generateId('AS'),
        customerId: currentUser?.id || generateId('guest'),
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        city: input.city,
        paymentMethod: input.paymentMethod,
        items: orderItems,
        subtotal,
        shippingFee,
        discount: input.discount,
        total,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        notes: input.notes,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Sync Order to FastAPI Backend & PostgreSQL Database + Notify Admin
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        const backendPayload = {
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          customer_phone: input.customerPhone || '',
          shipping_address: input.shippingAddress,
          city: input.city || '',
          payment_method: input.paymentMethod || 'Credit Card',
          subtotal: Number(subtotal.toFixed(2)),
          shipping_fee: Number(shippingFee.toFixed(2)),
          discount: Number((input.discount || 0).toFixed(2)),
          tax: 0,
          total_amount: Number(total.toFixed(2)),
          notes: input.notes || '',
          items: orderItems.map((item) => {
            const numericProdId = Number(item.productId);
            return {
              product_id: Number.isInteger(numericProdId) && numericProdId > 0 ? numericProdId : null,
              product_name: item.name,
              series: item.series || '',
              image_url: item.image || '',
              price: Number(item.price.toFixed(2)),
              quantity: item.quantity,
              variant: item.variant || '',
              total: Number((item.price * item.quantity).toFixed(2)),
            };
          }),
        };

        fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendPayload),
        })
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((serverOrder) => {
            const finalOrderNum = serverOrder?.order_number || newOrder.id;
            if (serverOrder?.order_number) {
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === newOrder.id ? { ...o, id: serverOrder.order_number } : o
                )
              );
            }

            // Broadcast Instant Notification to Admin Dashboard tab
            try {
              const channel = new BroadcastChannel('anime_store_channel');
              channel.postMessage({
                type: 'NEW_ORDER',
                orderNumber: finalOrderNum,
                customerName: input.customerName,
                total: total,
                itemsCount: orderItems.length,
              });
              channel.close();
            } catch (e) {}
          })
          .catch((err) => {
            console.warn('[Store] Backend order sync error (cached locally):', err);
            // Even if offline, still broadcast to admin dashboard
            try {
              const channel = new BroadcastChannel('anime_store_channel');
              channel.postMessage({
                type: 'NEW_ORDER',
                orderNumber: newOrder.id,
                customerName: input.customerName,
                total: total,
                itemsCount: orderItems.length,
              });
              channel.close();
            } catch (e) {}
          });
      } catch (err) {
        console.warn('[Store] Failed to initiate backend sync:', err);
      }

      // Decrement product inventory
      setProducts((prev) =>
        prev.map((product) => {
          const orderedQty = orderItems
            .filter((i) => i.productId === product.id)
            .reduce((sum, i) => sum + i.quantity, 0);
          if (!orderedQty) return product;
          return { ...product, stock: Math.max(0, product.stock - orderedQty) };
        })
      );

      // Update or register customer record
      setCustomers((prev) => {
        const idx = prev.findIndex((c) => c.email.toLowerCase() === input.customerEmail.toLowerCase());
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            name: input.customerName,
            phone: input.customerPhone,
            address: input.shippingAddress,
            city: input.city,
            ordersCount: updated[idx].ordersCount + 1,
            totalSpent: Number((updated[idx].totalSpent + total).toFixed(2)),
          };
          return updated;
        }
        return [
          {
            id: generateId('cust'),
            name: input.customerName,
            email: input.customerEmail,
            phone: input.customerPhone,
            address: input.shippingAddress,
            city: input.city,
            role: 'customer',
            clubMember: false,
            joinedAt: new Date().toISOString().split('T')[0],
            ordersCount: 1,
            totalSpent: Number(total.toFixed(2)),
          },
          ...prev,
        ];
      });

      setCart([]);
      showToast('Order placed!', `Confirmation #${newOrder.id} has been recorded.`);
      return newOrder;
    },
    [cart, currentUser?.id, products, setCart, setCustomers, setOrders, setProducts, settings, showToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus) => {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast('Order updated', `Order #${orderId} marked as ${status}.`);
    },
    [setOrders, showToast]
  );

  const deleteOrder = useCallback(
    (orderId: string) => {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('Order deleted', `Order #${orderId} removed.`, 'info');
    },
    [setOrders, showToast]
  );

  const deleteOrders = useCallback(
    (orderIds: string[]) => {
      const idSet = new Set(orderIds);
      setOrders((prev) => prev.filter((o) => !idSet.has(o.id)));
      showToast('Orders deleted', `${orderIds.length} order(s) removed.`, 'info');
    },
    [setOrders, showToast]
  );

  // Auth & Customers
  const login = useCallback(
    (email: string, password: string) => {
      if (!email.trim() || !password.trim()) {
        return { ok: false, error: 'Please enter both your email and password.' };
      }
      const existing = customers.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
      const session: UserSession = existing
        ? {
            id: existing.id,
            name: existing.name,
            email: existing.email,
            phone: existing.phone,
            address: existing.address,
            city: existing.city,
            role: existing.role,
            clubMember: existing.clubMember,
            joinedAt: existing.joinedAt,
          }
        : {
            id: generateId('cust'),
            name: email.split('@')[0].replace(/[._]/g, ' '),
            email: email.trim(),
            phone: '+855 12 345 678',
            address: 'Phnom Penh, Cambodia',
            city: 'Phnom Penh',
            role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
            clubMember: true,
            joinedAt: new Date().toISOString().split('T')[0],
          };
      setCurrentUser(session);
      showToast('Welcome back!', `Signed in as ${session.name}.`);
      return { ok: true, user: session };
    },
    [customers, setCurrentUser, showToast]
  );

  const register = useCallback(
    (data: { name: string; email: string; phone: string; password: string }) => {
      if (!data.name.trim() || !data.email.trim() || data.password.length < 6) {
        return { ok: false, error: 'Please fill in all fields (password at least 6 characters).' };
      }
      const alreadyExists = customers.some((c) => c.email.toLowerCase() === data.email.trim().toLowerCase());
      if (alreadyExists) {
        return { ok: false, error: 'An account with this email already exists. Try signing in.' };
      }
      const joinedAt = new Date().toISOString().split('T')[0];
      const newCustomer: Customer = {
        id: generateId('cust'),
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim() || '+855 12 000 000',
        address: 'Phnom Penh, Cambodia',
        city: 'Phnom Penh',
        role: 'customer',
        clubMember: true,
        joinedAt,
        ordersCount: 0,
        totalSpent: 0,
      };
      setCustomers((prev) => [newCustomer, ...prev]);
      const session: UserSession = {
        id: newCustomer.id,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        city: newCustomer.city,
        role: newCustomer.role,
        clubMember: newCustomer.clubMember,
        joinedAt: newCustomer.joinedAt,
      };
      setCurrentUser(session);
      showToast('Welcome to Anime Club!', 'Your account has been created.');
      return { ok: true, user: session };
    },
    [customers, setCurrentUser, setCustomers, showToast]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
    showToast('Signed out', 'See you next time in the Anime Universe.', 'info');
  }, [setCurrentUser, showToast]);

  const updateProfile = useCallback(
    (updates: Partial<UserSession>) => {
      setCurrentUser((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...updates };
        setCustomers((custs) =>
          custs.map((c) =>
            c.id === prev.id || c.email.toLowerCase() === prev.email.toLowerCase()
              ? {
                  ...c,
                  name: next.name,
                  email: next.email,
                  phone: next.phone,
                  address: next.address,
                  city: next.city,
                  clubMember: next.clubMember,
                }
              : c
          )
        );
        return next;
      });
      showToast('Profile saved', 'Your account details have been updated.');
    },
    [setCurrentUser, setCustomers, showToast]
  );

  const addCustomer = useCallback(
    (data: Omit<Customer, 'id' | 'joinedAt' | 'ordersCount' | 'totalSpent'>): Customer => {
      const created: Customer = {
        ...data,
        id: generateId('cust'),
        joinedAt: new Date().toISOString().split('T')[0],
        ordersCount: 0,
        totalSpent: 0,
      };
      setCustomers((prev) => [created, ...prev]);
      showToast('Customer added', `${created.name} added to customer directory.`);

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      fetch(`${API_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          club_member: Boolean(data.clubMember),
          status: 'active',
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((saved) => {
          if (saved?.id) {
            setCustomers((prev) =>
              prev.map((c) => (c.id === created.id ? { ...c, id: String(saved.id) } : c))
            );
          }
        })
        .catch(() => {});

      return created;
    },
    [setCustomers, showToast]
  );

  const updateCustomer = useCallback(
    (id: string, updates: Partial<Customer>) => {
      setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
      showToast('Customer updated', 'Customer record saved.');

      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        fetch(`${API_URL}/customers/${numId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(updates.name !== undefined ? { name: updates.name } : {}),
            ...(updates.email !== undefined ? { email: updates.email } : {}),
            ...(updates.phone !== undefined ? { phone: updates.phone } : {}),
            ...(updates.address !== undefined ? { address: updates.address } : {}),
            ...(updates.city !== undefined ? { city: updates.city } : {}),
            ...(updates.clubMember !== undefined ? { club_member: updates.clubMember } : {}),
          }),
        }).catch(() => {});
      }
    },
    [setCustomers, showToast]
  );

  const deleteCustomer = useCallback(
    (id: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      showToast('Customer removed', 'Customer record deleted.', 'info');

      const numId = Number(id);
      if (!Number.isNaN(numId)) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        fetch(`${API_URL}/customers/${numId}`, { method: 'DELETE' }).catch(() => {});
      }
    },
    [setCustomers, showToast]
  );

  const deleteCustomers = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      setCustomers((prev) => prev.filter((c) => !idSet.has(c.id)));
      showToast('Customers removed', `${ids.length} customer record(s) deleted.`, 'info');

      const numericIds = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
      if (numericIds.length > 0) {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
        fetch(`${API_URL}/customers/bulk-delete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: numericIds }),
        }).catch(() => {});
      }
    },
    [setCustomers, showToast]
  );

  const updateSettings = useCallback(
    (updates: Partial<StoreSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));

      const payload: Record<string, unknown> = {};
      if (updates.storeName !== undefined) payload.store_name = updates.storeName;
      if (updates.tagline !== undefined) payload.store_tagline = updates.tagline;
      if (updates.announcementText !== undefined) payload.announcement_text = updates.announcementText;
      if (updates.promoBannerTitle !== undefined) payload.promo_banner_title = updates.promoBannerTitle;
      if (updates.promoBannerSubtitle !== undefined) {
        payload.promo_banner_subtitle = updates.promoBannerSubtitle;
      }
      if (updates.heroBannerImage !== undefined) payload.hero_banner_image = updates.heroBannerImage;
      if (updates.promoBannerImage !== undefined) payload.promo_banner_image = updates.promoBannerImage;
      if (updates.clubBannerImage !== undefined) payload.club_banner_image = updates.clubBannerImage;
      if (updates.phone !== undefined) payload.phone = updates.phone;
      if (updates.email !== undefined) payload.email = updates.email;
      if (updates.address !== undefined) payload.address = updates.address;
      if (updates.freeShippingThreshold !== undefined) {
        payload.free_shipping_threshold = updates.freeShippingThreshold;
      }
      if (updates.standardShippingFee !== undefined) {
        payload.standard_rate = updates.standardShippingFee;
      }
      if (updates.clubDiscountPercent !== undefined) {
        payload.club_discount_percent = updates.clubDiscountPercent;
      }

      if (Object.keys(payload).length === 0) {
        showToast('Settings saved', 'Storefront configuration updated live.');
        return;
      }

      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';
      fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          setSettings((prev) => ({
            ...prev,
            storeName: data.store_name ?? prev.storeName,
            tagline: data.store_tagline ?? prev.tagline,
            announcementText: data.announcement_text ?? prev.announcementText,
            promoBannerTitle: data.promo_banner_title ?? prev.promoBannerTitle,
            promoBannerSubtitle: data.promo_banner_subtitle ?? prev.promoBannerSubtitle,
            heroBannerImage: data.hero_banner_image ?? prev.heroBannerImage,
            promoBannerImage: data.promo_banner_image ?? prev.promoBannerImage,
            clubBannerImage: data.club_banner_image ?? prev.clubBannerImage,
            phone: data.phone ?? prev.phone,
            email: data.email ?? prev.email,
            address: data.address ?? prev.address,
            freeShippingThreshold: Number(data.free_shipping_threshold ?? prev.freeShippingThreshold),
            standardShippingFee: Number(data.standard_rate ?? prev.standardShippingFee),
            clubDiscountPercent: Number(data.club_discount_percent ?? prev.clubDiscountPercent),
          }));
          try {
            const channel = new BroadcastChannel('anime_store_channel');
            channel.postMessage({ type: 'SETTINGS_UPDATED', settings: data });
            channel.close();
          } catch {}
          showToast('Settings saved', 'Storefront configuration saved to database.');
        })
        .catch(() => {
          showToast('Database sync warning', 'Saved locally, but failed to update backend database.', 'error');
        });
    },
    [setSettings, showToast]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      addReview,
      addCategory,
      updateCategory,
      deleteCategory,
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      wishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      orders,
      placeOrder,
      updateOrderStatus,
      deleteOrder,
      deleteOrders,
      customers,
      currentUser,
      login,
      register,
      logout,
      updateProfile,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      deleteCustomers,
      settings,
      updateSettings,
      toasts,
      showToast,
      dismissToast,
    }),
    [
      products,
      categories,
      addProduct,
      updateProduct,
      deleteProduct,
      updateStock,
      addReview,
      addCategory,
      updateCategory,
      deleteCategory,
      cart,
      cartCount,
      cartSubtotal,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      wishlist,
      isInWishlist,
      toggleWishlist,
      clearWishlist,
      orders,
      placeOrder,
      updateOrderStatus,
      deleteOrder,
      deleteOrders,
      customers,
      currentUser,
      login,
      register,
      logout,
      updateProfile,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      deleteCustomers,
      settings,
      updateSettings,
      toasts,
      showToast,
      dismissToast,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used inside a StoreProvider');
  }
  return ctx;
}
