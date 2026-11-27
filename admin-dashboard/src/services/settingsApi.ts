import type { StoreSettings } from '@/types';

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

export function mapBackendSettings(b: any, fallback: StoreSettings): StoreSettings {
  return {
    storeName: b.store_name ?? fallback.storeName,
    storeDescription: b.store_description ?? fallback.storeDescription,
    storeLogo: b.store_logo || fallback.storeLogo,
    storeTagline: b.store_tagline ?? fallback.storeTagline,
    email: b.email ?? fallback.email,
    phone: b.phone ?? fallback.phone,
    address: b.address ?? fallback.address,
    city: b.city ?? fallback.city,
    country: b.country ?? fallback.country,
    socialMedia: {
      facebook: b.social_media?.facebook ?? fallback.socialMedia.facebook,
      instagram: b.social_media?.instagram ?? fallback.socialMedia.instagram,
      twitter: b.social_media?.twitter ?? fallback.socialMedia.twitter,
      youtube: b.social_media?.youtube ?? fallback.socialMedia.youtube,
    },
    shipping: {
      freeShippingThreshold: Number(b.free_shipping_threshold ?? fallback.shipping.freeShippingThreshold),
      standardRate: Number(b.standard_rate ?? fallback.shipping.standardRate),
      expressRate: Number(b.express_rate ?? fallback.shipping.expressRate),
      estimatedDays: fallback.shipping.estimatedDays,
    },
    currency: b.currency ?? fallback.currency,
    currencySymbol: b.currency_symbol ?? fallback.currencySymbol,
    taxRate: Number(b.tax_rate ?? fallback.taxRate),
  };
}

export const settingsApi = {
  getSettings: async (fallback: StoreSettings): Promise<StoreSettings> => {
    const res = await request<any>('/settings');
    return mapBackendSettings(res, fallback);
  },

  updateSettings: async (data: Partial<StoreSettings>, fullFallback: StoreSettings): Promise<StoreSettings> => {
    const payload: Record<string, unknown> = {};
    if (data.storeName !== undefined) payload.store_name = data.storeName;
    if (data.storeDescription !== undefined) payload.store_description = data.storeDescription;
    if (data.storeTagline !== undefined) payload.store_tagline = data.storeTagline;
    if (data.storeLogo !== undefined) payload.store_logo = data.storeLogo;
    if (data.email !== undefined) payload.email = data.email;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.address !== undefined) payload.address = data.address;
    if (data.city !== undefined) payload.city = data.city;
    if (data.country !== undefined) payload.country = data.country;
    if (data.currency !== undefined) payload.currency = data.currency;
    if (data.currencySymbol !== undefined) payload.currency_symbol = data.currencySymbol;
    if (data.taxRate !== undefined) payload.tax_rate = data.taxRate;
    if (data.socialMedia !== undefined) payload.social_media = data.socialMedia;
    if (data.shipping !== undefined) {
      payload.free_shipping_threshold = data.shipping.freeShippingThreshold;
      payload.standard_rate = data.shipping.standardRate;
      payload.express_rate = data.shipping.expressRate;
    }

    const res = await request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return mapBackendSettings(res, fullFallback);
  },
};
