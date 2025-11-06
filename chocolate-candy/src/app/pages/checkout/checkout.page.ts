import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonText,
  IonButton,
  IonIcon,
  IonRadioGroup,
  IonRadio,
  IonListHeader,
  IonToast,
} from '@ionic/angular/standalone';
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-checkout',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/cart"></ion-back-button>
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Checkout</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <section class="summary" *ngIf="items.length; else emptyTpl">
        <ion-list-header>Order summary</ion-list-header>
        <ion-list lines="full">
          <ion-item *ngFor="let it of items">
            <ion-label>
              <h3>{{ it.name }} × {{ it.qty }}</h3>
              <p>₱ {{ it.price | number : '1.0-2' }}</p>
            </ion-label>
            <strong slot="end"
              >₱ {{ it.qty * it.price | number : '1.0-2' }}</strong
            >
          </ion-item>
          <ion-item>
            <ion-label>Subtotal</ion-label>
            <strong slot="end">₱ {{ subtotal | number : '1.0-2' }}</strong>
          </ion-item>
          <ion-item *ngIf="discountValue > 0">
            <ion-label>Discount ({{ discountLabel }})</ion-label>
            <strong slot="end"
              >- ₱ {{ discountValue | number : '1.0-2' }}</strong
            >
          </ion-item>
          <ion-item>
            <ion-label>Total</ion-label>
            <strong slot="end">₱ {{ total | number : '1.0-2' }}</strong>
          </ion-item>
        </ion-list>
      </section>

      <ng-template #emptyTpl>
        <div class="empty">
          <ion-text color="medium">Your cart is empty.</ion-text>
        </div>
      </ng-template>

      <form [formGroup]="form" (ngSubmit)="placeOrder()" class="form">
        <ion-list>
          <ion-item>
            <ion-input
              label="Promo code"
              labelPlacement="stacked"
              placeholder="SWEET10 or FREESHIP"
              formControlName="promo"
              (ionInput)="recomputeTotals()"
            ></ion-input>
          </ion-item>
        </ion-list>
        <ion-list>
          <ion-item>
            <ion-input
              label="Full name"
              labelPlacement="stacked"
              formControlName="name"
              autocomplete="name"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Phone"
              labelPlacement="stacked"
              formControlName="phone"
              inputmode="tel"
              autocomplete="tel"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="Address"
              labelPlacement="stacked"
              formControlName="address"
              autocomplete="street-address"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              label="City"
              labelPlacement="stacked"
              formControlName="city"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-textarea
              label="Notes"
              labelPlacement="stacked"
              formControlName="notes"
              autoGrow="true"
              placeholder="e.g., leave at the door"
            ></ion-textarea>
          </ion-item>
        </ion-list>

        <ion-list class="pay">
          <ion-list-header>Payment</ion-list-header>
          <ion-radio-group formControlName="payment">
            <ion-item>
              <ion-label>Cash on Delivery</ion-label>
              <ion-radio slot="end" value="cod"></ion-radio>
            </ion-item>
            <ion-item>
              <ion-label>PayPal</ion-label>
              <ion-radio slot="end" value="paypal"></ion-radio>
            </ion-item>
          </ion-radio-group>
          <div *ngIf="form.value.payment === 'paypal'">
            <ion-item>
              <ion-input
                label="Phone number (PayPal)"
                labelPlacement="stacked"
                formControlName="paypalPhone"
                inputmode="tel"
                placeholder="09xx xxx xxxx"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input
                type="password"
                label="PayPal password"
                labelPlacement="stacked"
                formControlName="paypalPassword"
              ></ion-input>
            </ion-item>
          </div>
        </ion-list>

        <ion-button
          expand="block"
          type="submit"
          [disabled]="form.invalid || !items.length"
          >Place order</ion-button
        >
      </form>

      <ion-toast
        [isOpen]="toastOpen"
        message="Order placed!"
        duration="1600"
        (ionToastDidDismiss)="toastOpen = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [
    `
      .empty {
        display: grid;
        place-items: center;
        padding: 24px;
      }
      .form {
        margin-top: 12px;
      }
      .pay {
        margin-top: 10px;
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsyncPipe,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonTextarea,
    IonText,
    IonButton,
    IonIcon,
    IonRadioGroup,
    IonRadio,
    IonListHeader,
    IonToast,
  ],
})
export class CheckoutPage {
  items = this.cart.getItemsSnapshot();
  subtotal = this.items.reduce((s: number, i: any) => s + i.qty * i.price, 0);
  discountLabel = '';
  discountValue = 0;
  get total() {
    return Math.max(0, this.subtotal - this.discountValue);
  }

  toastOpen = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    city: ['', [Validators.required]],
    notes: [''],
    promo: [''],
    payment: ['cod', [Validators.required]],
    paypalPhone: [''],
    paypalPassword: [''],
  });

  constructor(
    private cart: CartService,
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  recomputeTotals() {
    const code = (this.form.value.promo || '').toString().trim().toUpperCase();
    this.discountLabel = '';
    this.discountValue = 0;
    if (!this.subtotal) return;
    if (code === 'SWEET10') {
      this.discountLabel = 'SWEET10 (10%)';
      this.discountValue = +(this.subtotal * 0.1).toFixed(2);
    } else if (code === 'FREESHIP') {
      this.discountLabel = 'FREESHIP (₱50)';
      this.discountValue = Math.min(50, this.subtotal);
    }
  }

  placeOrder() {
    if (this.form.invalid || !this.items.length) return;
    // Basic PayPal validation when selected
    if (this.form.value.payment === 'paypal') {
      const phoneOk =
        (this.form.value.paypalPhone || '').toString().length >= 7;
      const passOk =
        (this.form.value.paypalPassword || '').toString().length >= 6;
      if (!phoneOk || !passOk) {
        alert('Please enter your PayPal phone and password.');
        return;
      }
    }
    const payload = {
      items: this.items.map((i: any) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      })),
      total: this.total,
      meta: {
        promo: this.form.value.promo || '',
        discountLabel: this.discountLabel,
        payment: this.form.value.payment,
        contact: {
          name: this.form.value.name,
          phone: this.form.value.phone,
          address: this.form.value.address,
          city: this.form.value.city,
        },
      },
    } as const;
    this.api.createOrder(payload).subscribe({
      next: (res: any) => {
        this.cart.clear();
        this.toastOpen = true;
        const id =
          res?.id || res?.order?.id || Math.floor(Math.random() * 1_000_000);
        setTimeout(() => this.router.navigate(['/order-success', id]), 600);
      },
      error: (err) => {
        console.error('Order create failed', err);
        alert(
          `Could not place your order right now. Please make sure the server is running at ${environment.apiBase} and that you are logged in. Your cart has been preserved.`
        );
      },
    });
  }
}
