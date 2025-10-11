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
    <ion-content>
      <ion-list>
        <ion-item *ngFor="let o of offers">
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
    },
    { title: '15% Off', subtitle: 'Orders over ₱500', badge: 'Save' },
  ];
}
