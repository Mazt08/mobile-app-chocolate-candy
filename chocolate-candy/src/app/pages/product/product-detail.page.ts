import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonImg,
  IonButton,
  IonToast,
  IonBadge,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { FLAT_PRODUCTS } from '../../data/catalog.data';
import type { Product } from '../../models/product.model';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../cart/cart.service';

@Component({
  standalone: true,
  selector: 'app-product-detail',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/catalog"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ product?.name || 'Product' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ng-container *ngIf="loading">
        <div class="skeleton">
          <ion-skeleton-text
            animated
            style="width: 100%; aspect-ratio: 1/1; border-radius: 8px;"
          ></ion-skeleton-text>
          <ion-skeleton-text
            animated
            style="width: 60%; height: 16px; margin-top: 12px;"
          ></ion-skeleton-text>
          <ion-skeleton-text
            animated
            style="width: 40%; height: 14px; margin-top: 6px;"
          ></ion-skeleton-text>
          <ion-skeleton-text
            animated
            style="width: 90%; height: 12px; margin-top: 14px;"
          ></ion-skeleton-text>
          <ion-skeleton-text
            animated
            style="width: 85%; height: 12px; margin-top: 6px;"
          ></ion-skeleton-text>
          <ion-skeleton-text
            animated
            style="width: 80%; height: 12px; margin-top: 6px;"
          ></ion-skeleton-text>
        </div>
      </ng-container>

      <ng-container *ngIf="!loading && product as p; else notFound">
        <ion-img [src]="p.img" alt="{{ p.name }}" class="hero-img"></ion-img>

        <div class="meta">
          <div class="row">
            <strong>Price:</strong>
            <span class="price">₱ {{ p.price | number : '1.0-0' }}</span>
            <ion-badge color="medium" *ngIf="soldOut">Sold out</ion-badge>
          </div>
          <div class="row" *ngIf="p.weight">
            <strong>Weight:</strong>
            <span>{{ p.weight }}</span>
          </div>
        </div>

        <div class="description" *ngIf="p.description">
          <h3>Description</h3>
          <p>{{ p.description }}</p>
        </div>

        <ion-button
          expand="block"
          [disabled]="soldOut"
          [color]="soldOut ? 'medium' : 'primary'"
          (click)="addToCart(p)"
        >
          Add to cart
        </ion-button>
      </ng-container>

      <ng-template #notFound>
        <p>Product not found.</p>
      </ng-template>

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
      .hero-img {
        width: 100%;
        aspect-ratio: 1/1;
        object-fit: cover;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .meta {
        display: grid;
        gap: 6px;
        margin-bottom: 12px;
      }
      .row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .price {
        font-weight: 800;
        font-size: 18px;
      }
      .description h3 {
        margin: 12px 0 6px;
      }
      .description p {
        margin: 0;
        color: var(--ion-color-medium);
      }
    `,
  ],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonImg,
    IonButton,
    IonToast,
    IonBadge,
    IonSkeletonText,
  ],
})
export class ProductDetailPage {
  product: Product | null = null;
  toastOpen = false;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private cart: CartService,
    private router: Router
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (Number.isFinite(id)) {
      // Local fallback first
      this.product = FLAT_PRODUCTS.find((p) => p.id === id) || null;
      if (this.product) this.loading = false;
      // Try hydrate from backend list
      this.api.getProducts().subscribe({
        next: (arr) => {
          const found = Array.isArray(arr)
            ? arr.find((x: any) => x.id === id)
            : null;
          if (found) {
            this.product = {
              id: found.id,
              name: found.name,
              description: found.description ?? '',
              price: found.price,
              weight: found.weight ?? '100g',
              category: found.category,
              img: found.img,
            };
            this.loading = false;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
    }
  }

  addToCart(p: Product) {
    this.cart.add({ id: p.id, name: p.name, price: p.price, img: p.img });
    this.toastOpen = true;
  }

  get soldOut(): boolean {
    const p: any = this.product as any;
    if (!p) return false;
    if (typeof p.outOfStock === 'boolean') return p.outOfStock;
    if (typeof p.available === 'boolean') return !p.available;
    if (typeof p.stock === 'number') return p.stock <= 0;
    return false;
  }
}
