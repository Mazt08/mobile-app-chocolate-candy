import { Component, OnInit } from '@angular/core';
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
  IonSelect,
  IonSelectOption,
  IonText,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

const STATUSES = ['Processing', 'Pending', 'Delivered'] as const;

@Component({
  standalone: true,
  selector: 'app-admin-orders',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>All Orders</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item *ngFor="let o of orders">
          <ion-label (click)="open(o)">
            <h2>#{{ o.id }} · {{ o.date }}</h2>
            <p>Total: ₱ {{ o.total | number : '1.0-2' }}</p>
            <p *ngIf="o.user">
              <ion-text color="medium"
                >{{ o.user.name }} · {{ o.user.email }}</ion-text
              >
            </p>
          </ion-label>
          <ion-select
            interface="popover"
            [value]="o.status"
            (ionChange)="changeStatus(o, $event.detail.value)"
          >
            <ion-select-option *ngFor="let s of statuses" [value]="s">{{
              s
            }}</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
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
    IonSelect,
    IonSelectOption,
    IonText,
  ],
})
export class AdminOrdersPage implements OnInit {
  orders: any[] = [];
  statuses = STATUSES as unknown as string[];
  constructor(private api: ApiService, private router: Router) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.api.getAdminOrders().subscribe({
      next: (res) => (this.orders = res || []),
      error: (err) => alert(err?.error?.error || 'Failed to load orders'),
    });
  }
  changeStatus(order: any, status: (typeof STATUSES)[number]) {
    if (order.status === status) return;
    this.api.updateOrderStatus(order.id, status).subscribe({
      next: (res: any) => (order.status = res?.status || status),
      error: (err: any) =>
        alert(err?.error?.error || 'Failed to update status'),
    });
  }
  open(order: any) {
    this.router.navigate(['/admin/orders', order.id]);
  }
}
