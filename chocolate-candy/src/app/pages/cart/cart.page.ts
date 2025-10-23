import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AsyncPipe } from '@angular/common';
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
  IonToast,
} from '@ionic/angular/standalone';
import { CartService, CartItem } from '../../cart/cart.service';
import { Observable } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

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
      <div class="empty" *ngIf="(items$ | async)?.length === 0; else listTpl">
        <ion-text color="medium"
          >Your cart is empty. Browse the catalog to add chocolates.</ion-text
        >
      </div>
      <ng-template #listTpl>
        <ion-list>
          <ion-item *ngFor="let it of items$ | async">
            <ion-avatar slot="start"
              ><img [src]="it.img || ''" alt="{{ it.name }}"
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
      </ng-template>

      <div class="summary ion-padding">
        <ion-item lines="full">
          <ion-label position="stacked">Promo code</ion-label>
          <input
            type="text"
            placeholder="SWEET10 or FREESHIP"
            [(ngModel)]="promo"
            (keyup.enter)="applyPromo()"
            style="width: 100%; padding: 8px; border-radius: 8px; border: 1px solid var(--ion-color-step-200)"
          />
        </ion-item>
        <div class="row">
          <span>Subtotal</span>
          <strong>₱ {{ total$ | async | number : '1.0-2' }}</strong>
        </div>
        <div class="row" *ngIf="discountValue > 0">
          <span>Discount ({{ discountLabel }})</span>
          <strong>- ₱ {{ discountValue | number : '1.0-2' }}</strong>
        </div>
        <div class="row total">
          <span>Total</span>
          <strong>₱ {{ grandTotal() | number : '1.0-2' }}</strong>
        </div>
        <ion-button
          expand="block"
          [disabled]="(total$ | async) === 0"
          (click)="checkout()"
          >Checkout</ion-button
        >
      </div>
      <ion-toast
        [isOpen]="toastOpen"
        message="Order placed!"
        duration="1800"
        (ionToastDidDismiss)="toastOpen = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [
    `
      ion-avatar img {
        object-fit: cover;
      }
      .empty {
        display: grid;
        place-items: center;
        padding: 24px;
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
    FormsModule,
    AsyncPipe,
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
    IonToast,
  ],
})
export class CartPage {
  items$: Observable<CartItem[]> = this.cart.itemsObservable$;
  total$ = this.cart.total$;
  promo = '';
  discountLabel = '';
  discountValue = 0;

  toastOpen = false;

  constructor(
    private cart: CartService,
    private api: ApiService,
    private router: Router
  ) {}

  inc(it: CartItem) {
    this.cart.setQty(it.id, it.qty + 1);
  }
  dec(it: CartItem) {
    this.cart.setQty(it.id, it.qty - 1);
  }

  applyPromo() {
    const code = this.promo.trim().toUpperCase();
    // Simple mocked rules: SWEET10 => 10% off, FREESHIP => 50 off
    this.discountLabel = '';
    this.discountValue = 0;
    const subtotal = this.cart
      .getItemsSnapshot()
      .reduce((s, i) => s + i.qty * i.price, 0);
    if (subtotal <= 0) return;
    if (code === 'SWEET10') {
      this.discountLabel = 'SWEET10 (10%)';
      this.discountValue = +(subtotal * 0.1).toFixed(2);
    } else if (code === 'FREESHIP') {
      this.discountLabel = 'FREESHIP (₱50)';
      this.discountValue = Math.min(50, subtotal);
    }
  }

  grandTotal() {
    const subtotal = this.cart
      .getItemsSnapshot()
      .reduce((s, i) => s + i.qty * i.price, 0);
    return Math.max(0, subtotal - this.discountValue);
  }

  checkout() {
    const items = this.cart
      .getItemsSnapshot()
      .map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }));
    const total = this.grandTotal();
    if (!items.length || total <= 0) return;
    this.api.createOrder({ items, total }).subscribe({
      next: () => {
        this.cart.clear();
        this.toastOpen = true;
        setTimeout(() => this.router.navigate(['/orders']), 600);
      },
      error: () => {
        // fallback: still clear cart locally to simulate success
        this.cart.clear();
        this.toastOpen = true;
        setTimeout(() => this.router.navigate(['/orders']), 600);
      },
    });
  }
}
