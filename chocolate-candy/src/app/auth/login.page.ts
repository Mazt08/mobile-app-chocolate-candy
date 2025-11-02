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
  selector: 'app-login',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="auth-hero">
        <ion-icon name="person-circle-outline" class="hero-icon"></ion-icon>
        <h1>Welcome back</h1>
        <p>Sign in to continue shopping</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
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
            autocomplete="current-password"
            required
          ></ion-input>
        </ion-item>

        <ion-button expand="block" type="submit" [disabled]="form.invalid">
          Login
        </ion-button>
        <ion-button
          expand="block"
          fill="clear"
          color="medium"
          (click)="goRegister()"
        >
          Create an account
        </ion-button>
      </form>

      <div class="tip">
        <ion-text color="medium">Demo: any email/password works.</ion-text>
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
export class LoginPage {
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
        ),
      ],
    ],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  async submit() {
    if (this.form.invalid) return;
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(email!, password!);
      this.router.navigate(['/home']);
    } catch (e: any) {
      const status = e?.status ?? 0;
      if (status === 0) {
        alert(
          'Cannot reach API. Please start the backend at http://localhost:3000 or update environment.apiBase.'
        );
      } else {
        alert(e?.error?.error || 'Login failed');
      }
    }
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
