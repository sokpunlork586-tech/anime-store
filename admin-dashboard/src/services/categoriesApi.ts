import type { Category } from '@/types';

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

export function mapBackendCategoryToFrontend(b: any): Category {
  return {
    id: String(b.id),
    name: b.name || '',
    slug: b.slug || '',
    description: b.description || '',
    image: b.image || '',
    productCount: Number(b.product_count ?? 0),
    status: b.status === 'inactive' ? 'inactive' : 'active',
    createdAt: b.created_at || new Date().toISOString(),
  };
}

export const categoriesApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await request<any[]>('/categories');
    return (res || []).map(mapBackendCategoryToFrontend);
  },

  createCategory: async (data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    status?: 'active' | 'inactive';
  }): Promise<Category> => {
    const payload = {
      name: data.name.trim(),
      slug: data.slug.trim(),
      short_name: data.name.trim().split(/\s+/)[0] || data.name.trim(),
      description: data.description || '',
      image: data.image || '',
      status: data.status || 'active',
    };
    const res = await request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendCategoryToFrontend(res);
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category | null> => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;

    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) {
      payload.name = data.name.trim();
      payload.short_name = data.name.trim().split(/\s+/)[0] || data.name.trim();
    }
    if (data.slug !== undefined) payload.slug = data.slug.trim();
    if (data.description !== undefined) payload.description = data.description;
    if (data.image !== undefined) payload.image = data.image;
    if (data.status !== undefined) payload.status = data.status;

    const res = await request<any>(`/categories/${numId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendCategoryToFrontend(res);
  },

  deleteCategory: async (id: string): Promise<void> => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return;
    await request<void>(`/categories/${numId}`, {
      method: 'DELETE',
    });
  },
};
