import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonContent,
  IonCard,
  IonAvatar,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  standalone: true,
  selector: 'app-developers',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Developers</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-card *ngFor="let d of devs" class="dev-card">
        <ion-item lines="none">
          <ion-avatar slot="start">
            <img [src]="d.img || defaultImg" alt="{{ d.name }}" />
          </ion-avatar>
          <ion-label>
            <h3 class="name">{{ d.name }}</h3>
            <p class="role">{{ d.role }}</p>
            <p class="github" *ngIf="d.github">
              GitHub:
              <a [href]="d.github" target="_blank" rel="noopener">{{
                d.github
              }}</a>
            </p>
          </ion-label>
          <ion-button
            *ngIf="d.github"
            fill="clear"
            size="small"
            [href]="d.github"
            target="_blank"
            aria-label="Open GitHub"
          >
            <ion-icon name="logo-github"></ion-icon>
          </ion-button>
        </ion-item>
      </ion-card>
    </ion-content>
  `,
  styles: [
    `
      .dev-card {
        margin-bottom: 12px;
      }
      .github {
        margin: 4px 0 0;
        font-size: 12px;
      }
      .github a {
        color: var(--ion-color-primary);
        text-decoration: underline;
      }
      .name {
        font-weight: 800;
        margin: 0;
      }
      .role {
        color: var(--ion-color-medium);
        margin: 4px 0 0;
      }
      ion-avatar img {
        object-fit: cover;
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
    IonCard,
    IonAvatar,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
  ],
})
export class DevelopersPage {
  defaultImg = 'assets/icon/favicon.png';
  devs = [
    {
      name: 'John Reex O. Aspiras',
      role: 'Fullstack Developer',
      github: 'https://github.com/Mazt08',
      img: 'https://github.com/Mazt08.png',
    },
    {
      name: 'Kurt Justine A. Avenido',
      role: 'No Role',
      img: '',
    },
    {
      name: 'Railey Modrigo',
      role: 'No Roles',
      img: '',
    },
  ];
}
