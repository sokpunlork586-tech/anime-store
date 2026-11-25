import type { DashboardStats, SalesDataPoint, OrderStatusData } from '@/types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('anime_admin_token') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  category: string;
  unitsSold: number;
  imageUrl: string;
  price: number;
}

export interface DashboardRecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: 'completed' | 'processing' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface DashboardOverview {
  stats: DashboardStats;
  salesOverview: SalesDataPoint[];
  orderStatus: OrderStatusData[];
  topProducts: DashboardTopProduct[];
  recentOrders: DashboardRecentOrder[];
}

export const dashboardApi = {
  getOverview: async (range: string): Promise<DashboardOverview> => {
    const sp = new URLSearchParams({ range });
    const response = await fetch(`${API_BASE}/dashboard/overview?${sp.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      stats: {
        totalOrders: Number(data.stats?.total_orders ?? 0),
        totalProducts: Number(data.stats?.total_products ?? 0),
        totalCustomers: Number(data.stats?.total_customers ?? 0),
        totalRevenue: Number(data.stats?.total_revenue ?? 0),
        orderGrowth: Number(data.stats?.order_growth ?? 0),
        productGrowth: Number(data.stats?.product_growth ?? 0),
        customerGrowth: Number(data.stats?.customer_growth ?? 0),
        revenueGrowth: Number(data.stats?.revenue_growth ?? 0),
      },
      salesOverview: (data.sales_overview || []).map((s: any) => ({
        day: s.day,
        thisMonth: Number(s.this_month ?? 0),
        lastMonth: Number(s.last_month ?? 0),
      })),
      orderStatus: (data.order_status || []).map((o: any) => ({
        status: o.status,
        count: Number(o.count ?? 0),
        percentage: Number(o.percentage ?? 0),
        color: o.color || '#D96532',
      })),
      topProducts: (data.top_products || []).map((p: any) => ({
        id: String(p.id),
        name: p.name,
        category: p.category || 'Collectibles',
        unitsSold: Number(p.units_sold ?? 0),
        imageUrl: p.image_url || '',
        price: Number(p.price ?? 0),
      })),
      recentOrders: (data.recent_orders || []).map((o: any) => ({
        id: String(o.id),
        orderNumber: o.order_number,
        customerName: o.customer_name || 'Customer',
        customerEmail: o.customer_email || '',
        totalAmount: Number(o.total_amount ?? 0),
        status: (o.status ? String(o.status).toLowerCase() : 'pending') as DashboardRecentOrder['status'],
        createdAt: o.created_at,
      })),
    };
  },
};
