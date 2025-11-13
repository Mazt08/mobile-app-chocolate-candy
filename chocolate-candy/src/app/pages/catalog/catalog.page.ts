import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonToast,
} from '@ionic/angular/standalone';
import { CartService } from '../../cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import type { Product, ProductCategory } from '../../models/product.model';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-catalog',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Catalog</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-searchbar
        [(ngModel)]="query"
        placeholder="Search products"
      ></ion-searchbar>
      <ion-segment [(ngModel)]="sort" value="popular" class="ion-margin-bottom">
        <ion-segment-button value="popular"
          ><ion-label>Popular</ion-label></ion-segment-button
        >
        <ion-segment-button value="priceAsc"
          ><ion-label>Price ↑</ion-label></ion-segment-button
        >
        <ion-segment-button value="priceDesc"
          ><ion-label>Price ↓</ion-label></ion-segment-button
        >
      </ion-segment>

      <div class="chips">
        <button
          class="chip"
          *ngFor="let c of categories"
          [class.active]="c === activeCat"
          (click)="setCategory(c)"
        >
          {{ c }}
        </button>
      </div>
      <app-product-list
        [categories]="visibleCategories"
        (add)="addToCart($event)"
      ></app-product-list>
      <ion-toast
        [isOpen]="toastOpen"
        message="Added to cart"
        duration="1200"
        (ionToastDidDismiss)="toastOpen = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [
    `
      .chips {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin: 6px 0 10px;
      }
      .chip {
        background: rgba(0, 0, 0, 0.06);
        color: var(--ion-text-color);
        border: 0;
        padding: 6px 10px;
        border-radius: 999px;
        font-weight: 600;
      }
      .chip.active {
        background: var(--ion-color-warning);
        color: var(--ion-color-warning-contrast, #000);
      }
    `,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonToast,
    ProductListComponent,
  ],
})
export class CatalogPage {
  query = '';
  sort: 'popular' | 'priceAsc' | 'priceDesc' = 'popular';
  categories: string[] = ['All'];
  activeCat: string = 'All';
  categoriesData: ProductCategory[] = [];
  products: Product[] = [];
  toastOpen = false;
  get visibleCategories(): ProductCategory[] {
    const filterFn = (p: Product) =>
      (!this.query ||
        p.name.toLowerCase().includes(this.query.toLowerCase())) &&
      (this.activeCat === 'All' || p.category === this.activeCat);
    return this.categoriesData
      .map((c) => ({ ...c, products: c.products.filter(filterFn) }))
      .filter((c) => c.products.length > 0);
  }

  constructor(
    private cart: CartService,
    private route: ActivatedRoute,
    private api: ApiService
  ) {
    // initialize categories to All; will hydrate from backend
    this.categories = ['All'];
    this.route.queryParamMap.subscribe((qp) => {
      const cat = qp.get('category');
      if (cat && this.categories.includes(cat)) {
        this.activeCat = cat;
      }
      const q = qp.get('q');
      if (q) this.query = q;
      const s = qp.get('sort');
      if (s === 'priceAsc' || s === 'priceDesc' || s === 'popular')
        this.sort = s;
    });

    // Hydrate from backend
    this.api.getCategories().subscribe({
      next: (cats) => {
        const set = new Set<string>(['All']);
        (cats || []).forEach((c: any) =>
          set.add(typeof c === 'string' ? c : c.name)
        );
        this.categories = Array.from(set);
      },
      error: () => {},
    });
    this.api.getProducts().subscribe({
      next: (arr) => {
        // Transform flat list into category groups
        const byCat = new Map<string, Product[]>();
        arr.forEach((p: any) => {
          const cat = p.category || 'Other';
          if (!byCat.has(cat)) byCat.set(cat, []);
          byCat.get(cat)!.push({
            id: p.id,
            name: p.name,
            description: p.description ?? '',
            price: p.price,
            weight: p.weight ?? '100g',
            category: cat,
            img: p.img,
          });
        });
        this.categoriesData = Array.from(byCat.entries()).map(
          ([name, products]) => ({ name, products })
        );
        this.products = arr.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description ?? '',
          price: p.price,
          weight: p.weight ?? '100g',
          category: p.category,
          img: p.img,
        }));
      },
      error: () => {},
    });
  }

  get filteredProducts(): Product[] {
    let arr = this.products.filter(
      (p) =>
        (!this.query ||
          p.name.toLowerCase().includes(this.query.toLowerCase())) &&
        (this.activeCat === 'All' || p.category === this.activeCat)
    );
    if (this.sort === 'priceAsc')
      arr = arr.slice().sort((a, b) => a.price - b.price);
    else if (this.sort === 'priceDesc')
      arr = arr.slice().sort((a, b) => b.price - a.price);
    return arr;
  }

  setCategory(c: string) {
    this.activeCat = c;
  }

  addToCart(p: Product) {
    this.cart.add({ id: p.id, name: p.name, price: p.price, img: p.img });
    this.toastOpen = true;
  }
}
