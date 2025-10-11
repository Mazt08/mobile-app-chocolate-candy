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
  IonBadge,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-orders',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>My Orders</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item *ngFor="let o of orders">
          <ion-label>
            <h3>Order #{{ o.id }}</h3>
            <p>
              {{ o.date }} • {{ o.items }} items • ₱
              {{ o.total | number : '1.0-2' }}
            </p>
          </ion-label>
          <ion-badge
            [color]="
              o.status === 'Delivered'
                ? 'success'
                : o.status === 'Processing'
                ? 'warning'
                : 'medium'
            "
            >{{ o.status }}</ion-badge
          >
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [``],
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
    IonBadge,
  ],
})
export class OrdersPage {
  orders = [
    {
      id: 1024,
      date: 'Oct 1, 2025',
      items: 3,
      total: 399,
      status: 'Delivered',
    },
    {
      id: 1025,
      date: 'Oct 7, 2025',
      items: 2,
      total: 228,
      status: 'Processing',
    },
  ];
}
