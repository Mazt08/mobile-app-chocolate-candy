import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { CartService } from '../../cart/cart.service';

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
    <ion-content class="ion-padding">
      <ion-segment [(ngModel)]="filter" value="all" class="ion-margin-bottom">
        <ion-segment-button value="all"
          ><ion-label>All</ion-label></ion-segment-button
        >
        <ion-segment-button value="processing"
          ><ion-label>Processing</ion-label></ion-segment-button
        >
        <ion-segment-button value="delivered"
          ><ion-label>Delivered</ion-label></ion-segment-button
        >
      </ion-segment>
      <ion-list>
        <ion-item *ngFor="let o of filteredOrders()" (click)="toggle(o)">
          <ion-label>
            <h3>Order #{{ o.id }}</h3>
            <p>
              {{ o.date }} • {{ o.items.length }} items • ₱
              {{ o.total | number : '1.0-2' }}
            </p>
            <div class="items" *ngIf="o.expanded">
              <div class="item-row" *ngFor="let it of o.items">
                <span>{{ it.name }} × {{ it.qty }}</span>
                <strong>₱ {{ it.qty * it.price | number : '1.0-2' }}</strong>
              </div>
              <ion-button
                size="small"
                (click)="reorder(o); $event.stopPropagation()"
              >
                <ion-icon name="refresh"></ion-icon>&nbsp;Reorder
              </ion-button>
            </div>
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
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonButton,
    IonIcon,
  ],
})
export class OrdersPage {
  filter: 'all' | 'processing' | 'delivered' = 'all';
  orders = [
    {
      id: 1024,
      date: 'Oct 1, 2025',
      items: [
        { id: 1, name: 'Dark Truffle', price: 129, qty: 2 },
        { id: 4, name: 'Hazelnut Praline', price: 141, qty: 1 },
      ],
      total: 399,
      status: 'Delivered',
      expanded: false,
    },
    {
      id: 1025,
      date: 'Oct 7, 2025',
      items: [
        { id: 2, name: 'Milk Caramel', price: 99, qty: 1 },
        { id: 5, name: 'Almond Crunch', price: 129, qty: 1 },
      ],
      total: 228,
      status: 'Processing',
      expanded: false,
    },
  ];

  constructor(private cart: CartService) {}

  filteredOrders() {
    if (this.filter === 'all') return this.orders;
    return this.orders.filter((o) =>
      this.filter === 'delivered'
        ? o.status === 'Delivered'
        : o.status === 'Processing'
    );
  }

  toggle(o: any) {
    o.expanded = !o.expanded;
  }

  reorder(o: any) {
    for (const it of o.items) {
      this.cart.add({ id: it.id, name: it.name, price: it.price });
    }
  }
}
