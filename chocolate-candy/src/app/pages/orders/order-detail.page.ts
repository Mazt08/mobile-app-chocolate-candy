import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonText,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-order-detail',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-back-button defaultHref="/orders"></ion-back-button
        ></ion-buttons>
        <ion-title>Order #{{ order?.id }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div *ngIf="order; else loading">
        <h2>
          <ion-badge
            [color]="
              order?.status === 'Delivered'
                ? 'success'
                : order?.status === 'Processing'
                ? 'warning'
                : 'medium'
            "
            >{{ order?.status }}</ion-badge
          >
          <ion-text color="medium">&nbsp;{{ order?.date }}</ion-text>
        </h2>
        <ion-list>
          <ion-item *ngFor="let it of order?.items">
            <ion-label>
              <h3>{{ it.name }} × {{ it.qty }}</h3>
              <p>₱ {{ it.price | number : '1.0-2' }}</p>
            </ion-label>
            <strong slot="end"
              >₱ {{ it.qty * it.price | number : '1.0-2' }}</strong
            >
          </ion-item>
          <ion-item>
            <ion-label>Total</ion-label>
            <strong slot="end">₱ {{ order?.total | number : '1.0-2' }}</strong>
          </ion-item>
        </ion-list>
        <div *ngIf="order?.meta" class="ion-margin-top">
          <h3>Delivery</h3>
          <p>
            {{ order?.meta?.contact?.name }} • {{ order?.meta?.contact?.phone }}
          </p>
          <p>
            {{ order?.meta?.contact?.address }},
            {{ order?.meta?.contact?.city }}
          </p>
          <p *ngIf="order?.meta?.contact?.notes">
            Notes: {{ order?.meta?.contact?.notes }}
          </p>
          <h3 class="ion-margin-top">Payment</h3>
          <p>Method: {{ order?.meta?.payment | titlecase }}</p>
          <p *ngIf="order?.meta?.discountLabel">
            Promo: {{ order?.meta?.discountLabel }}
          </p>
        </div>
      </div>
      <ng-template #loading>
        <ion-text color="medium">Loading order…</ion-text>
      </ng-template>
    </ion-content>
  `,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    IonText,
  ],
})
export class OrderDetailPage {
  order: any;
  constructor(private route: ActivatedRoute, private api: ApiService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getOrder(id).subscribe({
      next: (o) => (this.order = o),
      error: () => (this.order = null),
    });
  }
}
