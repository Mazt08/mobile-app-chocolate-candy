import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonButton,
  IonToast,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-contact',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/help"></ion-back-button>
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Contact Us</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <ion-list>
          <ion-item>
            <ion-input
              label="Subject"
              labelPlacement="stacked"
              formControlName="subject"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-textarea
              label="Message"
              labelPlacement="stacked"
              formControlName="message"
              autoGrow="true"
              rows="6"
              required
            ></ion-textarea>
          </ion-item>
        </ion-list>
        <ion-button type="submit" expand="block" [disabled]="form.invalid"
          >Send</ion-button
        >
      </form>

      <ion-toast
        [isOpen]="toastOpen"
        message="Message sent!"
        duration="1600"
        (ionToastDidDismiss)="toastOpen = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [``],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonTextarea,
    IonButton,
    IonToast,
  ],
})
export class ContactPage {
  form = this.fb.group({
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: ['', [Validators.required, Validators.minLength(5)]],
  });
  toastOpen = false;
  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private router: Router
  ) {}

  submit() {
    if (this.form.invalid) return;
    const { subject, message } = this.form.value as any;
    this.api.contact(subject, message).subscribe({
      next: () => {
        this.toastOpen = true;
        setTimeout(() => this.router.navigate(['/messages']), 600);
      },
      error: (err) => {
        console.error('Contact failed', err);
        alert('Could not send your message right now. Please try again later.');
      },
    });
  }
}
