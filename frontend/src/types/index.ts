export type ProductBadge = 'Best Seller' | 'New Arrival' | 'Hot' | 'Limited' | null;

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  series: string;
  categoryId: string;
  categoryName: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  gallery: string[];
  badge?: ProductBadge;
  featured: boolean;
  isNewArrival: boolean;
  stock: number;
  description: string;
  specifications: Record<string, string>;
  variants: string[];
  tags?: string[];
  reviews: ProductReview[];
  createdAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  image: string;
  iconKey: string;
  accentBg: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  variant?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  series: string;
  image: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  paymentMethod: 'Credit Card' | 'ABA Pay / KHQR' | 'Cash on Delivery';
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  role: 'customer' | 'admin';
  clubMember: boolean;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  role: 'customer' | 'admin';
  clubMember: boolean;
  joinedAt: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  announcementText: string;
  promoBannerTitle: string;
  promoBannerSubtitle: string;
  heroBannerImage?: string;
  promoBannerImage?: string;
  clubBannerImage?: string;
  phone: string;
  email: string;
  address: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  clubDiscountPercent: number;
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'error';
}
