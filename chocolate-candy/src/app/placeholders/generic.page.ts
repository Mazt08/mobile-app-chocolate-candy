import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/angular/standalone';

export function makePlaceholder(title: string) {
  @Component({
    standalone: true,
    selector: 'app-generic-placeholder',
    imports: [CommonModule, IonContent, IonHeader, IonToolbar, IonTitle],
    template: `
      <ion-header>
        <ion-toolbar color="primary">
          <ion-title>{{ title }}</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <h2>{{ title }}</h2>
        <p>
          This page is a placeholder. Implement
          <strong>{{ title }}</strong> content here.
        </p>
      </ion-content>
    `,
  })
  class GenericPageComponent {
    title = title;
  }
  return GenericPageComponent;
}
