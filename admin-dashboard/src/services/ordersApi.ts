import type { Order } from '@/types';

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

export function mapBackendOrderToFrontend(b: any): Order {
  const statusLower = (b.status ? b.status.toLowerCase() : 'pending') as Order['status'];
  const paymentStatusLower = (b.payment_status ? b.payment_status.toLowerCase() : 'pending') as Order['paymentStatus'];

  return {
    id: String(b.id || b.order_number),
    orderNumber: b.order_number || `#ORD-${b.id}`,
    customer: {
      id: String(b.user_id || `cust-${b.id}`),
      name: b.customer_name || 'Customer',
      email: b.customer_email || '',
      avatar: '',
    },
    items: (b.items || []).map((it: any) => ({
      productId: String(it.product_id || it.id),
      productName: it.product_name,
      productImage: it.image_url || '',
      quantity: it.quantity,
      price: it.price,
      total: it.total,
    })),
    subtotal: b.subtotal || 0,
    shipping: b.shipping_fee || 0,
    tax: b.tax || 0,
    totalAmount: b.total_amount || 0,
    status: statusLower,
    paymentStatus: paymentStatusLower,
    paymentMethod: b.payment_method || 'Credit Card / ABA KHQR',
    shippingAddress: `${b.shipping_address || ''}${b.city ? ', ' + b.city : ''}`,
    notes: b.notes || '',
    createdAt: b.created_at || new Date().toISOString(),
    updatedAt: b.updated_at || new Date().toISOString(),
  };
}

export const ordersApi = {
  getOrders: async (params?: { status?: string; search?: string; page?: number; page_size?: number }) => {
    const sp = new URLSearchParams();
    if (params?.status && params.status !== 'all') sp.set('status', params.status);
    if (params?.search) sp.set('search', params.search);
    if (params?.page) sp.set('page', String(params.page));
    sp.set('page_size', String(params?.page_size || 50));

    const res = await request<{ items: any[]; total: number }>(`/orders?${sp.toString()}`);
    return {
      items: (res.items || []).map(mapBackendOrderToFrontend),
      total: res.total,
    };
  },

  getOrderById: async (id: number | string) => {
    const res = await request<any>(`/orders/${id}`);
    return mapBackendOrderToFrontend(res);
  },

  updateOrderStatus: async (id: number | string, status: string, paymentStatus?: string) => {
    // Backend endpoint expects capitalized status (Pending, Processing, Shipped, Completed, Cancelled)
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    const res = await request<any>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: formattedStatus,
        payment_status: paymentStatus,
      }),
    });
    return mapBackendOrderToFrontend(res);
  },

  deleteOrder: async (id: number | string) => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    return request<{ deleted: boolean; id: number }>(`/orders/${numId}`, {
      method: 'DELETE',
    });
  },

  bulkDeleteOrders: async (ids: string[]) => {
    const numericIds = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    if (numericIds.length === 0) return { deleted: 0 };
    return request<{ deleted: number }>('/orders/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids: numericIds }),
    });
  },
};
