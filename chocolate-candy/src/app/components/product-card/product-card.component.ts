import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonButton,
  IonBadge,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import type { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
    IonButton,
    IonBadge,
  ],
  template: `
    <ion-card class="product-card">
      <ion-img
        class="product-img"
        [src]="product.img || placeholder"
        alt="{{ product.name }}"
        (click)="openDetails()"
      ></ion-img>
      <ion-card-header class="product-header">
        <ion-card-title
          class="product-title clickable"
          (click)="openDetails()"
          >{{ product.name }}</ion-card-title
        >
      </ion-card-header>
      <ion-card-content class="product-content">
        <div class="meta">
          <span class="price"
            ><ng-container *ngIf="product.priceNote as pn"
              >{{ pn }} </ng-container
            >₱ {{ product.price | number : '1.0-0' }}</span
          >
          <ion-badge color="medium" *ngIf="soldOut">Sold out</ion-badge>
        </div>
        <ion-button
          #detailsBtn
          [attr.data-details-btn]="product.id"
          expand="block"
          fill="clear"
          size="small"
          class="details-btn link-btn"
          (click)="openDetails()"
          >View details</ion-button
        >
        <ion-button
          expand="block"
          size="small"
          class="add-btn"
          [disabled]="soldOut"
          [color]="soldOut ? 'medium' : 'primary'"
          (click)="add.emit(product)"
          >Add to cart</ion-button
        >
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      /* Make the whole card stretch to fill the column and arrange vertically */
      .product-card {
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      /* Keep image square and cover */
      .product-img {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        display: block;
      }

      /* Let content take remaining space and keep button pinned to bottom */
      .product-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1 1 auto;
      }

      .product-title {
        font-size: 16px;
        line-height: 1.2;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        min-height: calc(1.2em * 2);
        letter-spacing: 0.2px;
        font-weight: 700;
      }

      .add-btn {
        margin-top: auto;
      }

      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .price {
        font-weight: 800;
        font-size: 14px;
      }
      .weight {
        color: var(--ion-color-medium);
        font-weight: 600;
      }
      .clickable {
        cursor: pointer;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();
  placeholder = 'assets/icon/favicon.png';
  constructor(private router: Router) {}

  openDetails() {
    this.router.navigate(['/product', (this.product as any)?.id ?? '']);
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
