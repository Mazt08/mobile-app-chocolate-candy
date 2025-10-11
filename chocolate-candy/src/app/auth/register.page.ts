import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonItem,
  IonInput,
  IonIcon,
  IonButton,
  IonText,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  standalone: true,
  selector: 'app-register',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Register</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-hero">
        <ion-icon name="person-add-outline" class="hero-icon"></ion-icon>
        <h1>Create account</h1>
        <p>Join ChocoExpress and start exploring</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <ion-item>
          <ion-input
            type="text"
            label="Name"
            labelPlacement="floating"
            formControlName="name"
            autocomplete="name"
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            type="email"
            label="Email"
            labelPlacement="floating"
            formControlName="email"
            autocomplete="email"
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            type="password"
            label="Password"
            labelPlacement="floating"
            formControlName="password"
            autocomplete="new-password"
            required
          ></ion-input>
        </ion-item>
        <ion-item>
          <ion-input
            type="password"
            label="Confirm password"
            labelPlacement="floating"
            formControlName="confirm"
            autocomplete="new-password"
            required
          ></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="form.invalid">
          Create account
        </ion-button>
        <ion-button
          expand="block"
          fill="clear"
          color="medium"
          (click)="goLogin()"
        >
          I already have an account
        </ion-button>
      </form>

      <div class="tip">
        <ion-text color="medium">Demo: simple validation only.</ion-text>
      </div>
    </ion-content>
  `,
  styles: [
    `
      .auth-hero {
        text-align: center;
        margin: 10px 0 24px;
      }
      .hero-icon {
        font-size: 56px;
        color: var(--ion-color-warning);
      }
      h1 {
        margin: 8px 0 4px;
        font-weight: 700;
      }
      p {
        margin: 0;
        opacity: 0.8;
      }
      ion-item {
        margin-bottom: 12px;
      }
      .tip {
        margin-top: 12px;
        text-align: center;
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonItem,
    IonInput,
    IonIcon,
    IonButton,
    IonText,
  ],
})
export class RegisterPage {
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  submit() {
    if (this.form.invalid) return;
    const { name, email, password, confirm } = this.form.getRawValue();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    this.auth.register(name!, email!, password!);
    this.router.navigate(['/home']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
