import { api } from './api';
import type { Order, OrderStatus } from '../types';

export const orderService = {
  async createOrder(orderData: {
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    shipping_address: string;
    city?: string;
    payment_method?: string;
    items: Array<{
      product_id?: number;
      product_name: string;
      series?: string;
      image_url?: string;
      price: number;
      quantity: number;
      variant?: string;
      total: number;
    }>;
    subtotal: number;
    shipping_fee?: number;
    discount?: number;
    tax?: number;
    total_amount: number;
    notes?: string;
  }): Promise<Order> {
    const res = await api.post<any>('/orders', orderData);
    return {
      id: String(res.id),
      customerId: String(res.user_id || ''),
      customerName: res.customer_name,
      customerEmail: res.customer_email,
      customerPhone: res.customer_phone,
      shippingAddress: res.shipping_address,
      city: res.city,
      paymentMethod: res.payment_method,
      items: res.items.map((i: any) => ({
        productId: String(i.product_id),
        name: i.product_name,
        series: i.series || '',
        image: i.image_url || '',
        price: i.price,
        quantity: i.quantity,
        variant: i.variant,
      })),
      subtotal: res.subtotal,
      shippingFee: res.shipping_fee,
      discount: res.discount,
      total: res.total_amount,
      status: res.status as OrderStatus,
      createdAt: res.created_at,
      notes: res.notes,
    };
  },

  async getMyOrders(page = 1, pageSize = 20): Promise<{ items: Order[]; total: number }> {
    const res = await api.get<any>('/orders/my-orders', { page, page_size: pageSize });
    const items = res.items.map((o: any) => ({
      id: String(o.id),
      customerId: String(o.user_id || ''),
      customerName: o.customer_name,
      customerEmail: o.customer_email,
      customerPhone: o.customer_phone,
      shippingAddress: o.shipping_address,
      city: o.city,
      paymentMethod: o.payment_method,
      items: o.items.map((i: any) => ({
        productId: String(i.product_id),
        name: i.product_name,
        series: i.series || '',
        image: i.image_url || '',
        price: i.price,
        quantity: i.quantity,
        variant: i.variant,
      })),
      subtotal: o.subtotal,
      shippingFee: o.shipping_fee,
      discount: o.discount,
      total: o.total_amount,
      status: o.status as OrderStatus,
      createdAt: o.created_at,
      notes: o.notes,
    }));
    return { items, total: res.total };
  },

  async getOrders(params?: any): Promise<any> {
    return api.get('/orders', params);
  },

  async updateOrderStatus(orderId: string | number, status: string): Promise<any> {
    return api.put(`/orders/${orderId}/status`, { status });
  },
};
