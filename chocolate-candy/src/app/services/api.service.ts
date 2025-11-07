import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiBase;
  constructor(private http: HttpClient) {}

  getCategories() {
    return this.http.get<string[]>(`${this.base}/categories`);
  }

  getProducts(params?: { q?: string; category?: string; sort?: string }) {
    return this.http.get<any[]>(`${this.base}/products`, {
      params: params as any,
    });
  }

  getOffers() {
    return this.http.get<any[]>(`${this.base}/offers`);
  }

  getOrders() {
    return this.http.get<any[]>(`${this.base}/orders`);
  }
  getOrder(id: number) {
    return this.http.get<any>(`${this.base}/orders/${id}`);
  }

  getDevelopers() {
    return this.http.get<any[]>(`${this.base}/developers`);
  }

  health() {
    return this.http.get<{ ok: boolean }>(`${this.base}/health`);
  }

  createOrder(payload: {
    items: Array<{ id: number; name: string; price: number; qty: number }>;
    total: number;
  }) {
    return this.http.post<any>(`${this.base}/orders`, payload);
  }

  // Auth endpoints
  register(payload: {
    name: string;
    username: string;
    email: string;
    password: string;
    role?: 'admin' | 'staff' | 'user';
  }) {
    return this.http.post<{ user: any; token: string }>(
      `${this.base}/register`,
      payload
    );
  }

  login(identity: string, password: string) {
    return this.http.post<{ user: any; token: string }>(`${this.base}/login`, {
      identity,
      password,
    });
  }

  // Admin
  getAdminUsers() {
    return this.http.get<any[]>(`${this.base}/admin/users`);
  }
  getAdminOrder(id: number) {
    return this.http.get<any>(`${this.base}/admin/orders/${id}`);
  }

  // Admin Orders
  getAdminOrders() {
    return this.http.get<any[]>(`${this.base}/admin/orders`);
  }

  updateOrderStatus(
    id: number,
    status: 'Processing' | 'Pending' | 'Delivered'
  ) {
    return this.http.patch<any>(`${this.base}/admin/orders/${id}/status`, {
      status,
    });
  }
}
