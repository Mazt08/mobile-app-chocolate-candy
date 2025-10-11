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
  IonList,
  IonItem,
  IonToggle,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label>Notifications</ion-label>
          <ion-toggle slot="end" [(ngModel)]="notifications"></ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>Dark mode</ion-label>
          <ion-toggle slot="end" [(ngModel)]="dark"></ion-toggle>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [``],
  imports: [
    CommonModule,
    IonHeader,
    FormsModule,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonList,
    IonItem,
    IonToggle,
    IonLabel,
  ],
})
export class SettingsPage {
  notifications = true;
  dark = false;
}
