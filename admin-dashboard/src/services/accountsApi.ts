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

export const accountsApi = {
  // ==================== PAYMENTS ====================
  getProviders: () => request<any[]>('/payments/providers'),
  updateProvider: (code: string, data: any) =>
    request<any>(`/payments/providers/${code}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getTransactions: (params?: { provider?: string; status?: string; search?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.provider && params.provider !== 'all') searchParams.set('provider', params.provider);
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    return request<any>(`/payments?${searchParams.toString()}`);
  },
  verifyTransaction: (transactionId: string, providerCode: string) =>
    request<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ transaction_id: transactionId, provider_code: providerCode }),
    }),
  refundTransaction: (id: string | number, refundAmount: number, reason: string) =>
    request<any>(`/payments/${id}/refund`, {
      method: 'POST',
      body: JSON.stringify({ refund_amount: refundAmount, reason }),
    }),

  // ==================== FINANCIAL ====================
  getFinancialSummary: () => request<any>('/financial/summary'),
  getFinancialAccounts: () => request<any[]>('/financial/accounts'),
  createFinancialAccount: (data: any) =>
    request<any>('/financial/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getIncome: (params?: { category?: string; search?: string; start_date?: string; end_date?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    return request<any>(`/financial/income?${searchParams.toString()}`);
  },
  createIncome: (data: any) =>
    request<any>('/financial/income', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getExpenses: (params?: { category?: string; search?: string; start_date?: string; end_date?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.start_date) searchParams.set('start_date', params.start_date);
    if (params?.end_date) searchParams.set('end_date', params.end_date);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    return request<any>(`/financial/expenses?${searchParams.toString()}`);
  },
  createExpense: (data: any) =>
    request<any>('/financial/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateExpense: (id: string | number, data: any) =>
    request<any>(`/financial/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getFinancialReports: (period = 'monthly') =>
    request<any>(`/financial/reports?period=${period}`),

  // ==================== USER ACCOUNTS ====================
  getUsers: (params?: { role?: string; is_active?: boolean; search?: string; page?: number; page_size?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.role && params.role !== 'all') searchParams.set('role', params.role);
    if (params?.is_active !== undefined) searchParams.set('is_active', String(params.is_active));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.page_size) searchParams.set('page_size', String(params.page_size));
    return request<any>(`/users?${searchParams.toString()}`);
  },
  createUser: (data: any) =>
    request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: string | number, data: any) =>
    request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleUserStatus: (id: string | number) =>
    request<any>(`/users/${id}/toggle-status`, {
      method: 'PATCH',
    }),
  resetPassword: (id: string | number, password: string) =>
    request<any>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: password }),
    }),
  getRoles: () => request<any[]>('/users/roles'),
  getPermissions: () => request<any[]>('/users/permissions'),
  getActivityLogs: (userId?: string | number) =>
    request<any>(userId ? `/users/${userId}/activity` : '/users/activity/all'),
};
