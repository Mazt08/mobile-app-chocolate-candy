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
  IonLabel,
  IonAvatar,
  IonText,
  IonInput,
  IonButton,
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
        <ion-item>
          <ion-label position="stacked">Display name</ion-label>
          <ion-input [(ngModel)]="edit.name"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Username</ion-label>
          <ion-input [(ngModel)]="edit.username"></ion-input>
        </ion-item>
        <ion-item>
          <ion-label position="stacked">Avatar URL</ion-label>
          <ion-input [(ngModel)]="edit.avatar"></ion-input>
        </ion-item>
        <ion-item lines="none">
          <ion-button expand="block" (click)="save()">Save</ion-button>
        </ion-item>
        <ion-item lines="none">
          <ion-button color="medium" expand="block" (click)="logout()"
            >Logout</ion-button
          >
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
    FormsModule,
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
    IonInput,
    IonButton,
  ],
})
export class ProfilePage {
  user = this.auth.user;
  edit = {
    name: this.user?.name || '',
    username: this.user?.username || '',
    avatar: this.user?.avatar || '',
  };
  constructor(private auth: AuthService) {}

  save() {
    const u = this.auth.user;
    if (!u) return;
    const next = {
      ...u,
      name: this.edit.name,
      username: this.edit.username,
      avatar: this.edit.avatar,
    };
    localStorage.setItem('chocoexpressUser', JSON.stringify(next));
    // naive in-place update (since AuthService reads from storage on reload, we also update live ref)
    (this as any).user = next;
  }

  logout() {
    this.auth.logout();
  }
}
