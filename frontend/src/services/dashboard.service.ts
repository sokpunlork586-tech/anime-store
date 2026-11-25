import { api } from './api';

export interface DashboardOverview {
  stats: {
    total_orders: number;
    total_products: number;
    total_customers: number;
    total_revenue: number;
    order_growth: number;
    product_growth: number;
    customer_growth: number;
    revenue_growth: number;
  };
  sales_overview: Array<{
    day: string;
    this_month: number;
    last_month: number;
  }>;
  order_status: Array<{
    status: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  top_products: Array<{
    id: number;
    name: string;
    category: string;
    units_sold: number;
    image_url: string;
    price: number;
  }>;
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    return api.get<DashboardOverview>('/dashboard/overview');
  },
};
