import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonButton,
} from '@ionic/angular/standalone';
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
  ],
  template: `
    <ion-card class="product-card">
      <ion-img
        class="product-img"
        [src]="product.img || placeholder"
        alt="{{ product.name }}"
      ></ion-img>
      <ion-card-header class="product-header">
        <ion-card-title class="product-title">{{
          product.name
        }}</ion-card-title>
      </ion-card-header>
      <ion-card-content class="product-content">
        <div class="desc" *ngIf="product.description as d">{{ d }}</div>
        <div class="meta">
          <span class="weight" *ngIf="product.weight">{{
            product.weight
          }}</span>
          <span class="price"
            ><ng-container *ngIf="product.priceNote as pn"
              >{{ pn }} </ng-container
            >₱ {{ product.price | number : '1.0-0' }}</span
          >
        </div>
        <ion-button
          expand="block"
          size="small"
          class="add-btn"
          (click)="add.emit(product)"
          >Add to cart</ion-button
        >
      </ion-card-content>
    </ion-card>
  `,
  styles: [
    `
      .desc {
        color: var(--ion-color-medium);
        font-size: 12px;
        margin-bottom: 6px;
      }
      .meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .price {
        font-weight: 800;
      }
      .weight {
        color: var(--ion-color-medium);
        font-weight: 600;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() add = new EventEmitter<Product>();
  placeholder = 'assets/icon/favicon.png';
}
