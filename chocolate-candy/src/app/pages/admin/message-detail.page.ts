import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  standalone: true,
  selector: 'app-admin-message-detail',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start"
          ><ion-back-button defaultHref="/admin/messages"></ion-back-button
        ></ion-buttons>
        <ion-title>{{ conversation?.subject || 'Conversation' }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <ion-list>
        <ion-item lines="none" *ngFor="let m of messages">
          <ion-label>
            <h3>
              {{
                m.sender_role === 'admin'
                  ? 'Admin'
                  : 'User #' + conversation?.user_id
              }}
              •
              {{ m.created_at | date : 'short' }}
            </h3>
            <p *ngIf="m.body">{{ m.body }}</p>
            <div *ngIf="m.image_url" class="msg-image-wrapper">
              <img [src]="m.image_url" alt="attachment" />
            </div>
          </ion-label>
        </ion-item>
      </ion-list>
      <form [formGroup]="form" (ngSubmit)="send()" class="composer">
        <ion-item>
          <ion-textarea
            label="Reply"
            labelPlacement="stacked"
            formControlName="message"
            autoGrow="true"
            rows="3"
          ></ion-textarea>
        </ion-item>
        <div class="upload-row">
          <input type="file" accept="image/*" (change)="onFile($event)" />
          <div class="preview" *ngIf="previewUrl">
            <img [src]="previewUrl" alt="preview" />
            <ion-button
              size="small"
              fill="clear"
              color="danger"
              (click)="clearImage()"
              >Remove</ion-button
            >
          </div>
        </div>
        <ion-button type="submit" expand="block" [disabled]="disableSend"
          >Send</ion-button
        >
      </form>
      <ion-segment value="status" class="mt">
        <ion-segment-button (click)="setStatus('open')"
          >Open</ion-segment-button
        >
        <ion-segment-button (click)="setStatus('closed')"
          >Closed</ion-segment-button
        >
      </ion-segment>
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button color="danger" (click)="remove()"
          ><ion-icon name="trash"></ion-icon
        ></ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [
    `
      .composer {
        margin-top: 12px;
      }
      .mt {
        margin-top: 12px;
      }
      .msg-image-wrapper img {
        max-width: 160px;
        border-radius: 6px;
        margin-top: 4px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }
      .upload-row {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 8px 8px 12px;
      }
      .preview img {
        max-width: 100px;
        border-radius: 4px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonTextarea,
    IonButton,
    IonSegment,
    IonSegmentButton,
    IonFab,
    IonFabButton,
    IonIcon,
  ],
})
export class AdminMessageDetailPage {
  id!: number;
  conversation: any;
  messages: any[] = [];
  form = this.fb.group({
    message: [''],
  });
  selectedFile?: File;
  previewUrl?: string;
  sending = false;
  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private fb: FormBuilder,
    private router: Router,
    private socket: SocketService
  ) {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.load();
    this.socket.messageNew$.subscribe((e) => {
      if (e?.conversationId === this.id) this.load();
    });
  }
  get disableSend() {
    const hasText = !!(this.form.value.message || '').trim();
    return this.sending || (!hasText && !this.selectedFile);
  }
  load() {
    this.api.adminGetConversation(this.id).subscribe((res) => {
      this.conversation = res?.conversation;
      this.messages = res?.messages || [];
    });
  }
  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;
    this.selectedFile = input.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(this.selectedFile);
  }
  clearImage() {
    this.selectedFile = undefined;
    this.previewUrl = undefined;
  }
  send() {
    if (this.disableSend) return;
    this.sending = true;
    const text = (this.form.value.message || '').trim();
    const doSend = (imageUrl?: string) => {
      this.api
        .adminReplyToConversation(this.id, text || undefined, imageUrl)
        .subscribe({
          next: () => {
            this.form.reset();
            this.clearImage();
            this.sending = false;
            this.load();
          },
          error: () => {
            alert('Failed to send message.');
            this.sending = false;
          },
        });
    };
    if (this.selectedFile) {
      this.api.uploadImage(this.selectedFile).subscribe({
        next: (r) => doSend(r.url),
        error: () => {
          alert('Image upload failed');
          this.sending = false;
        },
      });
    } else {
      doSend();
    }
  }
  setStatus(status: 'open' | 'closed') {
    this.api.adminSetConversationStatus(this.id, status).subscribe({
      next: () => this.load(),
      error: () => alert('Failed to update status'),
    });
  }
  remove() {
    if (!confirm('Remove this conversation?')) return;
    this.api.adminDeleteConversation(this.id).subscribe({
      next: () => this.router.navigate(['/admin/messages']),
      error: () => alert('Failed to remove conversation.'),
    });
  }
}
