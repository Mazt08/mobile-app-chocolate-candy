import { Component, OnInit } from '@angular/core';
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
  IonText,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';

@Component({
  standalone: true,
  selector: 'app-admin-users',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Users</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item *ngFor="let u of users">
          <ion-label>
            <h2>
              {{ u.name }}
              <ion-text color="medium">(@{{ u.username }})</ion-text>
            </h2>
            <p>{{ u.email }}</p>
          </ion-label>
          <ion-text color="medium">{{ u.role }}</ion-text>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
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
    IonText,
  ],
})
export class AdminUsersPage implements OnInit {
  users: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.getAdminUsers().subscribe({
      next: (res) => (this.users = res || []),
      error: (err) => alert(err?.error?.error || 'Failed to load users'),
    });
  }
}
