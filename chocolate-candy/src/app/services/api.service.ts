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

  getDevelopers() {
    return this.http.get<any[]>(`${this.base}/developers`);
  }

  createOrder(payload: {
    items: Array<{ id: number; name: string; price: number; qty: number }>;
    total: number;
  }) {
    return this.http.post<any>(`${this.base}/orders`, payload);
  }
}
