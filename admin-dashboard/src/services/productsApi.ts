import type { Product } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('anime_admin_token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function mapBackendProductToFrontend(b: any): Product {
  const gallery = Array.isArray(b.images)
    ? b.images.map((img: any) => img?.image_url).filter(Boolean)
    : [];
  const images = gallery.length > 0 ? gallery : b.image_url ? [b.image_url] : [];

  return {
    id: String(b.id),
    name: b.name || '',
    description: b.description || '',
    price: Number(b.price ?? 0),
    compareAtPrice: b.original_price != null ? Number(b.original_price) : undefined,
    category: b.category_name || 'Uncategorized',
    categoryId: String(b.category_id),
    sku: b.sku || '',
    stock: Number(b.stock_quantity ?? 0),
    status: b.status === 'draft' || b.status === 'archived' ? b.status : 'active',
    images,
    rating: Number(b.rating ?? 0),
    reviewCount: Number(b.review_count ?? 0),
    unitsSold: Number(b.units_sold ?? 0),
    tags: Array.isArray(b.tags) ? b.tags : [],
    createdAt: b.created_at || new Date().toISOString(),
    updatedAt: b.updated_at || new Date().toISOString(),
  };
}

export const productsApi = {
  getProducts: async (params?: { category_id?: number; status?: string; search?: string; page_size?: number }) => {
    const sp = new URLSearchParams();
    if (params?.category_id) sp.set('category_id', String(params.category_id));
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    sp.set('page_size', String(params?.page_size || 100));

    const res = await request<{ items: any[]; total: number }>(`/products?${sp.toString()}`);
    return {
      items: (res.items || []).map(mapBackendProductToFrontend),
      total: res.total ?? 0,
    };
  },

  createProduct: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'unitsSold'>): Promise<Product> => {
    const numericCategoryId = Number(data.categoryId);
    const cleanSku = (data.sku || `SKU-${Date.now().toString(36)}`).trim().slice(0, 50);
    const cleanName = (data.name || 'Anime Product').trim().slice(0, 255);
    const baseSlug = slugify(cleanName) || 'product';
    const cleanImages = (data.images || []).filter(Boolean);
    const payload = {
      sku: cleanSku,
      name: cleanName,
      slug: `${baseSlug}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.slice(0, 300),
      series: (data.category || '').slice(0, 100),
      category_id: Number.isNaN(numericCategoryId) ? 1 : numericCategoryId,
      price: Number(data.price),
      original_price: data.compareAtPrice ?? null,
      stock_quantity: Number(data.stock ?? 0),
      status: data.status || 'active',
      image_url: cleanImages[0] || '',
      images: cleanImages,
      description: data.description || '',
      tags: data.tags || [],
    };
    const res = await request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendProductToFrontend(res);
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product | null> => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name.trim();
    if (data.description !== undefined) payload.description = data.description;
    if (data.price !== undefined) payload.price = Number(data.price);
    if (data.compareAtPrice !== undefined) payload.original_price = data.compareAtPrice ?? null;
    if (data.categoryId !== undefined && !Number.isNaN(Number(data.categoryId))) {
      payload.category_id = Number(data.categoryId);
    }
    if (data.sku !== undefined) payload.sku = data.sku.trim();
    if (data.stock !== undefined) payload.stock_quantity = Number(data.stock);
    if (data.status !== undefined) payload.status = data.status;
    if (data.images !== undefined) {
      payload.images = data.images;
      payload.image_url = data.images[0] || '';
    }
    if (data.tags !== undefined) payload.tags = data.tags;

    const res = await request<any>(`/products/${numId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendProductToFrontend(res);
  },

  deleteProduct: async (id: string): Promise<void> => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return;
    await request<void>(`/products/${numId}`, {
      method: 'DELETE',
    });
  },
};
