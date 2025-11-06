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
  IonIcon,
  IonButton,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Admin</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item button detail (click)="go('/admin/users')">
          <ion-icon name="people-outline" slot="start"></ion-icon>
          <ion-label>Users</ion-label>
        </ion-item>
        <ion-item button detail (click)="go('/orders')">
          <ion-icon name="receipt-outline" slot="start"></ion-icon>
          <ion-label>Orders (view as list)</ion-label>
        </ion-item>
      </ion-list>
      <ion-button expand="block" fill="outline" (click)="go('/home')">
        Back to Home
      </ion-button>
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
    IonIcon,
    IonButton,
  ],
})
export class AdminPage {
  constructor(private router: Router) {}
  go(route: string) {
    this.router.navigateByUrl(route);
  }
}
