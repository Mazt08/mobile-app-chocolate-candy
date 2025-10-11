import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-developers',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Developers</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card *ngFor="let d of devs">
        <ion-card-header
          ><ion-card-title>{{ d.name }}</ion-card-title></ion-card-header
        >
        <ion-card-content>{{ d.role }}</ion-card-content>
      </ion-card>
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
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class DevelopersPage {
  devs = [
    { name: 'Mazt08', role: 'Lead Developer' },
    { name: 'ChocoBot', role: 'UI/UX' },
  ];
}
