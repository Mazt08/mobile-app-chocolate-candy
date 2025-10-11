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
  IonAvatar,
  IonText,
} from '@ionic/angular/standalone';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-profile',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Profile</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="ion-padding" *ngIf="user as u">
        <ion-avatar style="width:72px;height:72px;"
          ><img [src]="u.avatar || 'assets/icon/user-avatar.svg'" alt="avatar"
        /></ion-avatar>
        <h2 class="ion-padding-top">{{ u.name }}</h2>
        <ion-text color="medium">{{ u.email }}</ion-text>
      </div>
      <ion-list>
        <ion-item>
          <ion-label>Choco Points</ion-label>
          <ion-text>{{ user?.points ?? 0 }}</ion-text>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [
    `
      h2 {
        margin: 8px 0 0;
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
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonText,
  ],
})
export class ProfilePage {
  user = this.auth.user;
  constructor(private auth: AuthService) {}
}
