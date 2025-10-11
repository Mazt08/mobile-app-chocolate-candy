import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-help',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Help & FAQ</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-accordion-group>
        <ion-accordion value="ship">
          <ion-item slot="header"
            ><ion-label>How fast is delivery?</ion-label></ion-item
          >
          <div class="ion-padding" slot="content">
            2-3 days within Metro; 5-7 days provincial.
          </div>
        </ion-accordion>
        <ion-accordion value="pay">
          <ion-item slot="header"
            ><ion-label>What payment methods?</ion-label></ion-item
          >
          <div class="ion-padding" slot="content">
            GCash, credit/debit, COD (selected areas).
          </div>
        </ion-accordion>
      </ion-accordion-group>
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
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
  ],
})
export class HelpPage {}
