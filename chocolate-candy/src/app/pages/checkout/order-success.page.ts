import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonIcon,
  IonButton,
  IonText,
  IonSpinner,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-order-success',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Success</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="wrap">
        <ion-icon name="checkmark-circle" class="ok"></ion-icon>
        <h1>Order placed!</h1>
        <p>
          Receipt No.
          <strong>#{{ id }}</strong>
        </p>
        <div class="redirect">
          <ion-spinner name="dots"></ion-spinner>
          <ion-text color="medium">Taking you to My Orders…</ion-text>
        </div>
        <div class="actions">
          <ion-button expand="block" (click)="goOrders()"
            >View my orders</ion-button
          >
          <ion-button expand="block" fill="clear" (click)="goHome()"
            >Back to home</ion-button
          >
        </div>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .wrap {
        text-align: center;
        margin-top: 16vh;
      }
      .ok {
        font-size: 92px;
        color: var(--ion-color-success);
      }
      h1 {
        margin: 12px 0 4px;
        font-weight: 800;
      }
      p {
        margin: 0 0 18px;
      }
      .redirect {
        display: grid;
        place-items: center;
        gap: 6px;
        margin-bottom: 12px;
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
    IonIcon,
    IonButton,
    IonText,
    IonSpinner,
  ],
})
export class OrderSuccessPage {
  id = '';
  private timer?: any;
  constructor(private route: ActivatedRoute, private router: Router) {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.timer = setTimeout(() => this.goOrders(), 5000);
  }
  goOrders() {
    if (this.timer) clearTimeout(this.timer);
    this.router.navigate(['/orders']);
  }
  goHome() {
    if (this.timer) clearTimeout(this.timer);
    this.router.navigate(['/home']);
  }
}
