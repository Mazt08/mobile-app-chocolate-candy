import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  IonBadge,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  standalone: true,
  selector: 'app-messages',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-menu-button></ion-menu-button
        ></ion-buttons>
        <ion-title>My Messages</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-refresher slot="fixed" (ionRefresh)="refresh($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-list>
        <ion-item *ngFor="let c of conversations" (click)="open(c)">
          <ion-label>
            <h3>{{ c.subject }}</h3>
            <p>
              {{ c.status | titlecase }} • Updated
              {{ c.updated_at | date : 'short' }}
            </p>
          </ion-label>
          <ion-badge [color]="c.status === 'open' ? 'success' : 'medium'">{{
            c.status
          }}</ion-badge>
        </ion-item>
      </ion-list>
    </ion-content>
  `,
  styles: [``],
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
    IonBadge,
    IonRefresher,
    IonRefresherContent,
  ],
})
export class MessagesPage {
  conversations: any[] = [];
  constructor(
    private api: ApiService,
    private router: Router,
    socket: SocketService
  ) {
    this.load();
    socket.messageNew$.subscribe(() => this.load());
    socket.conversationNew$.subscribe(() => this.load());
  }
  load() {
    this.api
      .getMyConversations()
      .subscribe((rows) => (this.conversations = rows || []));
  }
  refresh(ev: any) {
    this.api.getMyConversations().subscribe({
      next: (rows) => {
        this.conversations = rows || [];
        ev.target.complete();
      },
      error: () => ev.target.complete(),
    });
  }
  open(c: any) {
    this.router.navigate(['/messages', c.id]);
  }
}
