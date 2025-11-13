import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-downloads',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Downloads</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <p>
        I-download ang Android APK ng Chocolate Candy app dito. Kung hindi
        gumana ang primary link, subukan ang fallback link sa ibaba.
      </p>
      <ion-list lines="none">
        <ion-item>
          <ion-label>Primary APK Link</ion-label>
          <ion-button
            [href]="apkPrimary"
            target="_blank"
            rel="noopener"
            fill="solid"
            color="success"
          >
            <ion-icon slot="start" name="download-outline"></ion-icon>
            Download APK
          </ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Fallback (Uploads)</ion-label>
          <ion-button
            [href]="apkFallbackUploads"
            target="_blank"
            rel="noopener"
            fill="outline"
          >
            <ion-icon slot="start" name="cloud-download-outline"></ion-icon>
            /uploads/app.apk
          </ion-button>
        </ion-item>
        <ion-item>
          <ion-label>Fallback (Bundled)</ion-label>
          <ion-button
            [href]="apkFallbackBundled"
            target="_blank"
            rel="noopener"
            fill="outline"
          >
            <ion-icon slot="start" name="file-tray-full-outline"></ion-icon>
            /downloads/app.apk
          </ion-button>
        </ion-item>
      </ion-list>
      <p class="hint">
        Tip: Kung nasa Android ka, maaaring kailangan mong payagan ang "Install
        unknown apps" kung hindi galing Play Store.
      </p>
    </ion-content>
  `,
  styles: [
    `
      .hint {
        margin-top: 16px;
        color: var(--ion-color-medium);
      }
    `,
  ],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class DownloadsPage {
  apkPrimary = environment.apkUrl || '/uploads/app.apk';
  apkFallbackUploads = '/uploads/app.apk';
  apkFallbackBundled = '/downloads/app.apk';
}
