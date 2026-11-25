import { api } from './api';
import type { UserSession } from '../types';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  address?: string;
  city?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: UserSession; tokens: AuthTokens }> {
    const tokens = await api.post<AuthTokens>('/auth/login', credentials);
    api.setToken(tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    const userProfile = await this.getCurrentUser();
    return { user: userProfile, tokens };
  },

  async register(data: RegisterData): Promise<{ user: UserSession; tokens: AuthTokens }> {
    const tokens = await api.post<AuthTokens>('/auth/register', data);
    api.setToken(tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);

    const userProfile = await this.getCurrentUser();
    return { user: userProfile, tokens };
  },

  async getCurrentUser(): Promise<UserSession> {
    const data = await api.get<any>('/auth/me');
    return {
      id: String(data.id),
      name: data.full_name,
      email: data.email,
      phone: data.phone || '',
      address: data.address || '',
      city: data.city || '',
      role: data.role || 'customer',
      clubMember: data.club_member || false,
      joinedAt: data.created_at || new Date().toISOString(),
    };
  },

  logout() {
    api.removeToken();
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('auth_token'));
  },
};
