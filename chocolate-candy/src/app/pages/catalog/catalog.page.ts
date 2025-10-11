import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonButton,
} from '@ionic/angular/standalone';

interface Product {
  id: number;
  name: string;
  price: number;
  img: string;
}

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
      <ion-grid fixed>
        <ion-row>
          <ion-col
            size="6"
            sizeMd="6"
            sizeLg="4"
            sizeXl="3"
            *ngFor="let p of products"
          >
            <ion-card class="product-card">
              <ion-img
                class="product-img"
                [src]="p.img"
                alt="{{ p.name }}"
              ></ion-img>
              <ion-card-header class="product-header">
                <ion-card-title class="product-title">{{
                  p.name
                }}</ion-card-title>
              </ion-card-header>
              <ion-card-content class="product-content">
                <div class="price">₱ {{ p.price | number : '1.0-2' }}</div>
                <ion-button expand="block" size="small" class="add-btn"
                  >Add to cart</ion-button
                >
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
  `,
  styles: [
    `
      ion-grid {
        padding-inline: 0;
      }
      ion-row {
        row-gap: 12px;
      }
      .product-card {
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
        margin: 6px 4px;
      }
      .product-img {
        height: 140px;
        object-fit: cover;
        width: 100%;
      }
      .product-header {
        padding-bottom: 0;
      }
      .product-title {
        font-weight: 700;
        font-size: 14px;
        line-height: 1.2;
      }
      .product-content {
        margin-top: auto;
      }
      .price {
        color: var(--ion-color-medium);
        font-weight: 600;
      }
      .add-btn {
        margin-top: 8px;
        --border-radius: 10px;
      }
    `,
  ],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonImg,
    IonButton,
  ],
})
export class CatalogPage {
  products: Product[] = [
    {
      id: 1,
      name: 'Dark Truffle',
      price: 99,
      img: 'assets/catalog/dark-truffle.jpg',
    },
    {
      id: 2,
      name: 'Caramel Crunch',
      price: 129,
      img: 'assets/catalog/caramel-crunch.jpg',
    },
    {
      id: 3,
      name: 'Hazelnut Praline',
      price: 149,
      img: 'assets/catalog/hazelnut-praline.jpg',
    },
    {
      id: 4,
      name: 'Matcha Bites',
      price: 119,
      img: 'assets/catalog/matcha-bites.jpg',
    },
  ];
}
