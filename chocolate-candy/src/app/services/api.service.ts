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
    meta?: any;
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

  // Admin Products CRUD
  getAdminProducts() {
    return this.http.get<any[]>(`${this.base}/admin/products`);
  }
  createAdminProduct(payload: any) {
    return this.http.post<any>(`${this.base}/admin/products`, payload);
  }
  updateAdminProduct(id: number, payload: any) {
    return this.http.patch<any>(`${this.base}/admin/products/${id}`, payload);
  }
  deleteAdminProduct(id: number) {
    return this.http.delete<void>(`${this.base}/admin/products/${id}`);
  }

  // Admin Offers CRUD
  getAdminOffers() {
    return this.http.get<any[]>(`${this.base}/admin/offers`);
  }
  createAdminOffer(payload: any) {
    return this.http.post<any>(`${this.base}/admin/offers`, payload);
  }
  updateAdminOffer(id: number, payload: any) {
    return this.http.patch<any>(`${this.base}/admin/offers/${id}`, payload);
  }
  deleteAdminOffer(id: number) {
    return this.http.delete<void>(`${this.base}/admin/offers/${id}`);
  }

  // Messaging (user)
  contact(subject: string, message: string) {
    return this.http.post<any>(`${this.base}/contact`, { subject, message });
  }
  getMyConversations() {
    return this.http.get<any[]>(`${this.base}/messages`);
  }
  getConversation(id: number) {
    return this.http.get<any>(`${this.base}/messages/${id}`);
  }
  replyToConversation(id: number, message?: string, imageUrl?: string) {
    const payload: any = {};
    if (message) payload.message = message;
    if (imageUrl) payload.imageUrl = imageUrl;
    return this.http.post<any>(`${this.base}/messages/${id}/reply`, payload);
  }
  markConversationRead(id: number) {
    return this.http.post<any>(`${this.base}/messages/${id}/read`, {});
  }
  deleteConversation(id: number) {
    return this.http.delete<void>(`${this.base}/messages/${id}`);
  }

  // Messaging (admin)
  adminGetConversations() {
    return this.http.get<any[]>(`${this.base}/admin/messages`);
  }
  adminGetConversation(id: number) {
    return this.http.get<any>(`${this.base}/admin/messages/${id}`);
  }
  adminReplyToConversation(id: number, message?: string, imageUrl?: string) {
    const payload: any = {};
    if (message) payload.message = message;
    if (imageUrl) payload.imageUrl = imageUrl;
    return this.http.post<any>(
      `${this.base}/admin/messages/${id}/reply`,
      payload
    );
  }
  adminSetConversationStatus(id: number, status: 'open' | 'closed') {
    return this.http.patch<any>(`${this.base}/admin/messages/${id}/status`, {
      status,
    });
  }
  adminMarkConversationRead(id: number) {
    return this.http.post<any>(`${this.base}/admin/messages/${id}/read`, {});
  }
  adminDeleteConversation(id: number) {
    return this.http.delete<void>(`${this.base}/admin/messages/${id}`);
  }

  // Uploads
  uploadImage(file: File) {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<{ url: string }>(`${this.base}/upload`, form);
  }

  // Unread counts
  getUserUnreadCount() {
    return this.http.get<{ unread: number }>(
      `${this.base}/messages/unread-count`
    );
  }
  getAdminUnreadCount() {
    return this.http.get<{ unread: number }>(
      `${this.base}/admin/messages/unread-count`
    );
  }
}
