import { Component, computed, signal } from '@angular/core';
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
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-auth',
  template: `
    <ion-header>
      <ion-toolbar class="gradient-toolbar">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>{{
          activeTab() === 'login' ? 'Welcome back' : 'Create account'
        }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding auth-content">
      <div class="title-wrap">
        <h1>
          {{ activeTab() === 'login' ? 'Welcome back' : 'Create account' }}
        </h1>
        <p>
          {{
            activeTab() === 'login'
              ? 'Log in to continue your shopping'
              : 'Join us and start exploring'
          }}
        </p>
      </div>

      <ion-segment [value]="activeTab()" (ionChange)="onTabChange($event)">
        <ion-segment-button value="login">
          <ion-label>Login</ion-label>
        </ion-segment-button>
        <ion-segment-button value="signup">
          <ion-label>Sign Up</ion-label>
        </ion-segment-button>
      </ion-segment>

      <!-- LOGIN FORM -->
      <form
        *ngIf="activeTab() === 'login'"
        [formGroup]="loginForm"
        (ngSubmit)="submitLogin()"
        novalidate
      >
        <div class="card">
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
        </div>

        <ion-button
          expand="block"
          type="submit"
          [disabled]="loginForm.invalid"
          class="cta-gradient"
        >
          Login
        </ion-button>
        <div class="link-alt">
          <span>New here?</span>
          <button type="button" class="link" (click)="switchTo('signup')">
            Create an account
          </button>
        </div>
      </form>

      <!-- SIGNUP FORM -->
      <form
        *ngIf="activeTab() === 'signup'"
        [formGroup]="signupForm"
        (ngSubmit)="submitSignup()"
        novalidate
      >
        <div class="card">
          <ion-item>
            <ion-input
              type="text"
              label="Full name"
              labelPlacement="floating"
              formControlName="name"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="text"
              label="Username"
              labelPlacement="floating"
              formControlName="username"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="email"
              label="Email"
              labelPlacement="floating"
              formControlName="email"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="password"
              label="Password"
              labelPlacement="floating"
              formControlName="password"
              required
            ></ion-input>
          </ion-item>
          <ion-item>
            <ion-input
              type="password"
              label="Confirm password"
              labelPlacement="floating"
              formControlName="confirm"
              required
            ></ion-input>
          </ion-item>
        </div>

        <ion-button
          expand="block"
          type="submit"
          [disabled]="signupForm.invalid"
          class="cta-gradient"
        >
          Create Account
        </ion-button>
        <div class="link-alt">
          <span>Already have an account?</span>
          <button type="button" class="link" (click)="switchTo('login')">
            Login
          </button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [
    `
      .gradient-toolbar {
        --background: var(--ion-toolbar-background);
        --color: var(--ion-color-primary);
      }
      .auth-content {
        --background: var(--ion-background-color);
      }
      .title-wrap {
        text-align: center;
        margin: 16px 0 10px;
      }
      h1 {
        margin: 6px 0;
        font-weight: 800;
        color: var(--ion-color-primary);
      }
      p {
        margin: 0;
        color: var(--ion-color-medium);
      }
      ion-segment {
        margin: 8px 0 10px;
        --background: transparent;
      }
      ion-segment-button {
        --color-checked: var(--ion-color-primary);
      }
      .card {
        background: white;
        border-radius: 14px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        margin-bottom: 14px;
      }
      ion-item {
        --inner-padding-end: 8px;
      }
      .cta-gradient {
        --background: linear-gradient(
          90deg,
          var(--ion-color-secondary),
          var(--ion-color-primary)
        );
        color: #fff;
        font-weight: 700;
        border-radius: 16px;
        height: 48px;
      }
      .link-alt {
        margin: 12px 0 0;
        text-align: center;
        color: #7a7a7a;
      }
      .link {
        background: none;
        border: none;
        color: var(--ion-color-secondary);
        font-weight: 700;
        margin-left: 6px;
      }
      .tip {
        text-align: center;
        margin-top: 8px;
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
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonLabel,
  ],
})
export class AuthPage {
  // UI tab state
  private tab = signal<'login' | 'signup'>('login');
  activeTab = computed(() => this.tab());

  loginForm = this.fb.group({
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

  signupForm = this.fb.group({
    username: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_\.\-]+$/),
      ],
    ],
    name: ['', [Validators.required, Validators.minLength(2)]],
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
    confirm: ['', [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {}

  onTabChange(ev: CustomEvent) {
    const val = (ev.detail as any).value as 'login' | 'signup';
    this.tab.set(val);
  }

  switchTo(tab: 'login' | 'signup') {
    this.tab.set(tab);
  }

  async submitLogin() {
    if (this.loginForm.invalid) return;
    const { email, password } = this.loginForm.getRawValue();
    try {
      await this.auth.login(email!, password!);
      this.router.navigate(['/home']);
    } catch (e: any) {
      const status = e?.status ?? 0;
      if (status === 0) {
        alert(
          'Cannot reach API at ' +
            environment.apiBase +
            '\nPlease start the backend or update environment.apiBase.'
        );
      } else {
        alert(e?.error?.error || 'Login failed');
      }
    }
  }

  async submitSignup() {
    if (this.signupForm.invalid) return;
    const { username, name, email, password, confirm } =
      this.signupForm.getRawValue();
    if (password !== confirm) {
      alert('Passwords do not match');
      return;
    }
    try {
      await this.auth.register(
        name!,
        username!,
        (email || '').trim(),
        password!
      );
      this.router.navigate(['/home']);
    } catch (e: any) {
      const status = e?.status ?? 0;
      if (status === 0) {
        alert(
          'Cannot reach API at ' +
            environment.apiBase +
            '\nPlease start the backend or update environment.apiBase.'
        );
      } else {
        const msg = e?.error?.error || e?.message || 'Registration failed';
        alert(msg);
      }
    }
  }
}
