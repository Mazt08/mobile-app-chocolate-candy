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
  IonToggle,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { ThemeService, ThemePreference } from '../../shared/theme.service';

@Component({
  standalone: true,
  selector: 'app-settings',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item>
          <ion-label>Notifications</ion-label>
          <ion-toggle slot="end" [(ngModel)]="notifications"></ion-toggle>
        </ion-item>
        <ion-item>
          <ion-label>Theme</ion-label>
          <ion-select
            interface="popover"
            [(ngModel)]="themePref"
            (ionChange)="applyTheme()"
          >
            <ion-select-option value="system">System</ion-select-option>
            <ion-select-option value="light">Light</ion-select-option>
            <ion-select-option value="dark">Dark</ion-select-option>
          </ion-select>
        </ion-item>
        <ion-item>
          <ion-label>Currency</ion-label>
          <ion-select interface="popover" [(ngModel)]="currency">
            <ion-select-option value="PHP">PHP ₱</ion-select-option>
            <ion-select-option value="USD">USD $</ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [``],
  imports: [
    CommonModule,
    IonHeader,
    FormsModule,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonMenuButton,
    IonContent,
    IonList,
    IonItem,
    IonToggle,
    IonLabel,
    IonSelect,
    IonSelectOption,
  ],
})
export class SettingsPage {
  notifications = true;
  themePref: ThemePreference = 'system';
  currency: 'PHP' | 'USD' = 'PHP';

  constructor(private theme: ThemeService) {
    this.themePref = this.theme.getPreference();
  }

  applyTheme() {
    this.theme.setPreference(this.themePref);
  }
}
