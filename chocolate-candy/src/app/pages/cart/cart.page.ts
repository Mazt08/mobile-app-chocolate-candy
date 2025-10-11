import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  img: string;
}

@Component({
  standalone: true,
  selector: 'app-cart',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Shopping Cart</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item *ngFor="let it of items">
          <ion-avatar slot="start"
            ><img [src]="it.img" alt="{{ it.name }}"
          /></ion-avatar>
          <ion-label>
            <h3>{{ it.name }}</h3>
            <p>₱ {{ it.price | number : '1.0-2' }}</p>
          </ion-label>
          <ion-buttons slot="end">
            <ion-button size="small" (click)="dec(it)">-</ion-button>
            <ion-text>{{ it.qty }}</ion-text>
            <ion-button size="small" (click)="inc(it)">+</ion-button>
          </ion-buttons>
        </ion-item>
      </ion-list>

      <div class="summary ion-padding">
        <div class="row">
          <span>Subtotal</span>
          <strong>₱ {{ subtotal | number : '1.0-2' }}</strong>
        </div>
        <ion-button expand="block" [disabled]="subtotal === 0"
          >Checkout</ion-button
        >
      </div>
    </ion-content>
  `,
  styles: [
    `
      ion-avatar img {
        object-fit: cover;
      }
      .summary .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
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
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonButton,
    IonText,
  ],
})
export class CartPage {
  items: CartItem[] = [
    {
      id: 1,
      name: 'Dark Truffle',
      price: 99,
      qty: 1,
      img: 'assets/catalog/dark-truffle.jpg',
    },
    {
      id: 2,
      name: 'Caramel Crunch',
      price: 129,
      qty: 2,
      img: 'assets/catalog/caramel-crunch.jpg',
    },
  ];
  get subtotal() {
    return this.items.reduce((s, it) => s + it.price * it.qty, 0);
  }
  inc(it: CartItem) {
    it.qty++;
  }
  dec(it: CartItem) {
    if (it.qty > 0) it.qty--;
  }
}
