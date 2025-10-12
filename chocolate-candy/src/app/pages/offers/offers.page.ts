import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  selector: 'app-offers',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Special Offers</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item *ngFor="let o of offers" (click)="goTo(o)">
          <ion-label>
            <h3>{{ o.title }}</h3>
            <p>{{ o.subtitle }}</p>
          </ion-label>
          <ion-badge color="warning">{{ o.badge }}</ion-badge>
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
export class OffersPage {
  offers = [
    {
      title: 'Buy 1 Get 1',
      subtitle: 'Dark Truffle BOGO this week',
      badge: 'New',
      target: { category: 'Dark' },
    },
    {
      title: '15% Off',
      subtitle: 'Orders over ₱500',
      badge: 'Save',
      target: { sort: 'priceAsc' },
    },
    {
      title: 'Nutty Deals',
      subtitle: 'Best picks with nuts',
      badge: 'Yum',
      target: { category: 'Nuts' },
    },
    {
      title: 'Premium Picks',
      subtitle: 'Top-rated treats',
      badge: 'Hot',
      target: { sort: 'popular' },
    },
  ];
  constructor(private router: Router) {}
  goTo(o: { target?: any; subtitle: string }) {
    const queryParams = o.target ?? { sort: 'priceAsc' };
    this.router.navigate(['/catalog'], { queryParams });
  }
}
