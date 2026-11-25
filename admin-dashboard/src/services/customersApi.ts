import type { Customer } from '@/types';

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

  return response.json();
}

export function mapBackendCustomerToFrontend(b: any): Customer {
  return {
    id: String(b.id),
    name: b.name || '',
    email: b.email || '',
    phone: b.phone || '',
    avatar: b.avatar || '',
    address: b.address || '',
    city: b.city || '',
    country: b.country || 'Cambodia',
    totalOrders: Number(b.total_orders ?? 0),
    totalSpent: Number(b.total_spent ?? 0),
    joinedAt: b.joined_at || b.created_at || new Date().toISOString(),
    lastOrderAt: b.last_order_at || b.joined_at || b.created_at || new Date().toISOString(),
    status: b.status === 'inactive' ? 'inactive' : 'active',
  };
}

export const customersApi = {
  getCustomers: async (params?: { status?: string; search?: string; page?: number; page_size?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', String(params.page));
    sp.set('page_size', String(params?.page_size || 200));

    const res = await request<{ items: any[]; total: number }>(`/customers?${sp.toString()}`);
    return {
      items: (res.items || []).map(mapBackendCustomerToFrontend),
      total: res.total ?? 0,
    };
  },

  updateCustomer: async (id: string, data: Partial<Customer>) => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.avatar !== undefined) payload.avatar = data.avatar;
    if (data.address !== undefined) payload.address = data.address;
    if (data.city !== undefined) payload.city = data.city;
    if (data.country !== undefined) payload.country = data.country;
    if (data.status !== undefined) payload.status = data.status;

    const res = await request<any>(`/customers/${numId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendCustomerToFrontend(res);
  },

  deleteCustomer: async (id: string) => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    return request<{ deleted: boolean; id: number }>(`/customers/${numId}`, {
      method: 'DELETE',
    });
  },

  bulkDeleteCustomers: async (ids: string[]) => {
    const numericIds = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    if (numericIds.length === 0) return { deleted: 0 };
    return request<{ deleted: number }>('/customers/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: numericIds }),
    });
  },
};
