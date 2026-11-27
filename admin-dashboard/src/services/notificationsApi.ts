import type { Notification } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('anime_admin_token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

function mapNotification(b: any): Notification {
  const validTypes: Notification['type'][] = ['order', 'review', 'inventory', 'system'];
  const nType = validTypes.includes(b.type) ? b.type : 'system';
  return {
    id: String(b.id),
    title: b.title || 'Notification',
    message: b.message || '',
    type: nType,
    read: Boolean(b.read),
    createdAt: b.created_at || new Date().toISOString(),
  };
}

export const notificationsApi = {
  getNotifications: async () => {
    const res = await request<{
      items: any[];
      unread_count: number;
      telegram_configured: boolean;
    }>('/notifications');
    return {
      items: (res.items || []).map(mapNotification),
      unreadCount: Number(res.unread_count ?? 0),
      telegramConfigured: Boolean(res.telegram_configured),
    };
  },

  markRead: async (id: string) => {
    const numId = Number(id);
    if (Number.isNaN(numId)) return null;
    const res = await request<any>(`/notifications/${numId}/read`, { method: 'PUT' });
    return mapNotification(res);
  },

  markAllRead: async () => {
    return request<{ updated: number }>('/notifications/read-all', { method: 'PUT' });
  },

  sendTestTelegram: async (message?: string) => {
    const res = await request<{ sent: boolean; detail: string; notification: any }>(
      '/notifications/test-telegram',
      {
        method: 'POST',
        body: JSON.stringify({ message }),
      }
    );
    return {
      sent: Boolean(res.sent),
      detail: res.detail || '',
      notification: res.notification ? mapNotification(res.notification) : null,
    };
  },
};
