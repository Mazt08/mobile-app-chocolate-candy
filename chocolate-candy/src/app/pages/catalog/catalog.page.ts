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
} from '@ionic/angular/standalone';
import { CartService } from '../../cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import { CATALOG_DATA, FLAT_PRODUCTS } from '../../data/catalog.data';
import type { Product, ProductCategory } from '../../models/product.model';
import { ProductListComponent } from '../../components/product-list/product-list.component';

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
    ProductListComponent,
  ],
})
export class CatalogPage {
  query = '';
  sort: 'popular' | 'priceAsc' | 'priceDesc' = 'popular';
  categories: string[] = ['All'];
  activeCat: string = 'All';
  categoriesData: ProductCategory[] = CATALOG_DATA;
  products: Product[] = FLAT_PRODUCTS;
  get visibleCategories(): ProductCategory[] {
    const filterFn = (p: Product) =>
      (!this.query ||
        p.name.toLowerCase().includes(this.query.toLowerCase())) &&
      (this.activeCat === 'All' || p.category === this.activeCat);
    return this.categoriesData
      .map((c) => ({ ...c, products: c.products.filter(filterFn) }))
      .filter((c) => c.products.length > 0);
  }

  constructor(private cart: CartService, private route: ActivatedRoute) {
    // derive categories list from data
    const set = new Set<string>(['All']);
    this.categoriesData.forEach((cat) => set.add(cat.name));
    this.categories = Array.from(set);
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
  }
}
