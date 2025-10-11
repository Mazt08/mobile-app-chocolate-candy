import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonChip,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-categories',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Categories</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="chips">
        <ion-chip *ngFor="let c of categories" outline>
          <ion-icon [name]="c.icon"></ion-icon>
          <ion-label>{{ c.label }}</ion-label>
        </ion-chip>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      ion-chip {
        --color: var(--ion-color-dark);
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
    IonChip,
    IonIcon,
    IonLabel,
  ],
})
export class CategoriesPage {
  categories = [
    { label: 'Dark', icon: 'moon-outline' },
    { label: 'Milk', icon: 'cafe-outline' },
    { label: 'White', icon: 'snow-outline' },
    { label: 'Nuts', icon: 'leaf-outline' },
    { label: 'Caramel', icon: 'flame-outline' },
    { label: 'Fruit', icon: 'apple-outline' },
  ];
}
