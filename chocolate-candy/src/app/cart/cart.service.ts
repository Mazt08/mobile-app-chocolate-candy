import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img?: string;
}

const STORAGE_KEY = 'choco_cart_v1';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items$ = new BehaviorSubject<CartItem[]>(this.load());

  readonly count$ = this.items$.pipe(
    map((items) => items.reduce((s, i) => s + i.qty, 0))
  );
  readonly total$ = this.items$.pipe(
    map((items) => items.reduce((s, i) => s + i.qty * i.price, 0))
  );
  readonly itemsObservable$ = this.items$.asObservable();

  private load(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  private save(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  add(item: Omit<CartItem, 'qty'>, qty = 1) {
    const items = [...this.items$.value];
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx > -1) items[idx] = { ...items[idx], qty: items[idx].qty + qty };
    else items.push({ ...item, qty });
    this.items$.next(items);
    this.save(items);
  }

  setQty(id: number, qty: number) {
    const items = this.items$.value
      .map((i) => (i.id === id ? { ...i, qty: Math.max(0, qty) } : i))
      .filter((i) => i.qty > 0);
    this.items$.next(items);
    this.save(items);
  }

  remove(id: number) {
    const items = this.items$.value.filter((i) => i.id !== id);
    this.items$.next(items);
    this.save(items);
  }
  clear() {
    this.items$.next([]);
    this.save([]);
  }

  getItemsSnapshot() {
    return this.items$.value;
  }
}
