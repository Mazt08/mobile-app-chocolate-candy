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
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonTextarea,
  IonInput,
  IonButton,
  IonToast,
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

      <div class="ion-padding-top">
        <h2>Contact us</h2>
        <ion-item>
          <ion-input placeholder="Your email" [(ngModel)]="email"></ion-input>
        </ion-item>
        <ion-item>
          <ion-textarea
            autoGrow="true"
            placeholder="Message"
            [(ngModel)]="message"
          ></ion-textarea>
        </ion-item>
        <ion-button expand="block" (click)="send()">Send</ion-button>
      </div>
      <ion-toast
        [isOpen]="toastOpen"
        message="Thanks! We'll get back to you."
        duration="2000"
        (ionToastDidDismiss)="toastOpen = false"
      ></ion-toast>
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
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel,
    IonTextarea,
    IonInput,
    IonButton,
    IonToast,
  ],
})
export class HelpPage {
  email = '';
  message = '';
  toastOpen = false;

  send() {
    if (!this.email || !this.message) return;
    this.toastOpen = true;
    this.email = '';
    this.message = '';
  }
}
