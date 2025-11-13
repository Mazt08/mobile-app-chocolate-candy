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
import { CartService } from '../../cart/cart.service';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../auth/auth.service';
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
            <ion-label>Shipping</ion-label>
            <strong slot="end">₱ {{ shippingFee | number : '1.0-2' }}</strong>
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
        <ion-list *ngIf="offers.length">
          <ion-list-header>Special Offers</ion-list-header>
          <ion-radio-group
            [value]="selectedOfferId"
            (ionChange)="onOfferChange($event)"
          >
            <ion-item *ngFor="let o of offers">
              <ion-label>
                <h3>{{ o.title }}</h3>
                <p>
                  {{ o.subtitle }}
                  <ng-container *ngIf="o.points_cost > 0">
                    • Costs {{ o.points_cost }} pts
                  </ng-container>
                </p>
              </ion-label>
              <ion-radio slot="end" [value]="o.id"></ion-radio>
            </ion-item>
          </ion-radio-group>
          <ion-item
            *ngIf="selectedOfferRequiresPoints && !hasEnoughPoints"
            color="danger"
          >
            <ion-label>Choco points are not enough</ion-label>
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
  shippingFee = 50;
  offers: any[] = [];
  selectedOfferId: number | null = null;
  selectedOfferRequiresPoints = false;
  hasEnoughPoints = true;
  get userPoints() {
    return this.auth.user?.points ?? 0;
  }
  get total() {
    const net = Math.max(0, this.subtotal - this.discountValue);
    return net + this.shippingFee;
  }

  toastOpen = false;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    address: ['', [Validators.required, Validators.minLength(4)]],
    city: ['', [Validators.required]],
    notes: [''],
    payment: ['cod', [Validators.required]],
    paypalPhone: [''],
    paypalPassword: [''],
  });

  constructor(
    private cart: CartService,
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.api.getOffers().subscribe((rows) => {
      this.offers = rows || [];
      // Auto-select the first one if exists
      if (this.offers.length) {
        this.selectedOfferId = this.offers[0].id;
        this.applyOffer();
      }
    });
  }

  onOfferChange(ev: any) {
    this.selectedOfferId = ev?.detail?.value ?? null;
    this.applyOffer();
  }

  applyOffer() {
    this.discountLabel = '';
    this.discountValue = 0;
    this.selectedOfferRequiresPoints = false;
    this.hasEnoughPoints = true;
    if (!this.subtotal || !this.selectedOfferId) return;
    const o = this.offers.find((x) => x.id === this.selectedOfferId);
    if (!o) return;
    const t = (o.discount_type || 'percent').toLowerCase();
    const val = Number(o.discount_value || 0);
    if (t === 'fixed') {
      this.discountLabel = `${o.title} (₱${val})`;
      this.discountValue = Math.min(val, this.subtotal);
    } else {
      const d = +(this.subtotal * (val / 100)).toFixed(2);
      this.discountLabel = `${o.title} (${val}%)`;
      this.discountValue = Math.min(d, this.subtotal);
    }
    if (o.points_cost && o.points_cost > 0) {
      this.selectedOfferRequiresPoints = true;
      this.hasEnoughPoints = this.userPoints >= Number(o.points_cost);
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
        offerId: this.selectedOfferId,
        discountLabel: this.discountLabel,
        shippingFee: this.shippingFee,
        payment: this.form.value.payment,
        contact: {
          name: this.form.value.name,
          phone: this.form.value.phone,
          address: this.form.value.address,
          city: this.form.value.city,
        },
      },
    } as const;
    this.api.createOrder(payload as any).subscribe({
      next: (res: any) => {
        this.cart.clear();
        this.toastOpen = true;
        const id =
          res?.id || res?.order?.id || Math.floor(Math.random() * 1_000_000);
        setTimeout(() => this.router.navigate(['/order-success', id]), 600);
      },
      error: (err) => {
        console.error('Order create failed', err);
        const msg = err?.error?.error || 'Unknown error';
        if (/choco points/i.test(msg)) {
          alert('Choco points are not enough for this offer.');
        } else {
          alert(
            `Could not place your order right now. Please make sure the server is running at ${environment.apiBase} and that you are logged in. Your cart has been preserved.`
          );
        }
      },
    });
  }
}
