import { api } from './api';
import type { Product } from '../types';

export interface ProductQueryParams {
  category_id?: number;
  category_slug?: string;
  status?: string;
  search?: string;
  featured?: boolean;
  is_new_arrival?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export const productService = {
  async getProducts(params?: ProductQueryParams): Promise<PaginatedResult<Product>> {
    const res = await api.get<any>('/products', params);
    const items = res.items.map((p: any) => ({
      id: String(p.id),
      sku: p.sku,
      name: p.name,
      series: p.series || '',
      categoryId: String(p.category_id),
      categoryName: p.category_name || '',
      price: p.price,
      originalPrice: p.original_price,
      rating: p.rating || 0,
      reviewCount: p.review_count || 0,
      image: p.image_url || '',
      gallery: p.images?.map((img: any) => img.image_url) || [],
      badge: p.badge || null,
      featured: p.featured || false,
      isNewArrival: p.is_new_arrival || false,
      stock: p.stock_quantity || 0,
      description: p.description || '',
      specifications: p.specifications || {},
      variants: p.variants || [],
      reviews: [],
      createdAt: p.created_at,
    }));

    return {
      items,
      total: res.total,
      page: res.page,
      page_size: res.page_size,
      total_pages: res.total_pages,
    };
  },

  async getProductById(id: string | number): Promise<Product> {
    const p = await api.get<any>(`/products/${id}`);
    return {
      id: String(p.id),
      sku: p.sku,
      name: p.name,
      series: p.series || '',
      categoryId: String(p.category_id),
      categoryName: p.category_name || '',
      price: p.price,
      originalPrice: p.original_price,
      rating: p.rating || 0,
      reviewCount: p.review_count || 0,
      image: p.image_url || '',
      gallery: p.images?.map((img: any) => img.image_url) || [],
      badge: p.badge || null,
      featured: p.featured || false,
      isNewArrival: p.is_new_arrival || false,
      stock: p.stock_quantity || 0,
      description: p.description || '',
      specifications: p.specifications || {},
      variants: p.variants || [],
      reviews: [],
      createdAt: p.created_at,
    };
  },

  async getProductBySlug(slug: string): Promise<Product> {
    const p = await api.get<any>(`/products/slug/${slug}`);
    return {
      id: String(p.id),
      sku: p.sku,
      name: p.name,
      series: p.series || '',
      categoryId: String(p.category_id),
      categoryName: p.category_name || '',
      price: p.price,
      originalPrice: p.original_price,
      rating: p.rating || 0,
      reviewCount: p.review_count || 0,
      image: p.image_url || '',
      gallery: p.images?.map((img: any) => img.image_url) || [],
      badge: p.badge || null,
      featured: p.featured || false,
      isNewArrival: p.is_new_arrival || false,
      stock: p.stock_quantity || 0,
      description: p.description || '',
      specifications: p.specifications || {},
      variants: p.variants || [],
      reviews: [],
      createdAt: p.created_at,
    };
  },

  async createProduct(data: any): Promise<any> {
    return api.post('/products', data);
  },

  async updateProduct(id: string | number, data: any): Promise<any> {
    return api.put(`/products/${id}`, data);
  },

  async deleteProduct(id: string | number): Promise<void> {
    return api.delete(`/products/${id}`);
  },
};
