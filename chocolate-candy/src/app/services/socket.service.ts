import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket?: Socket;
  messageNew$ = new Subject<{
    conversationId: number;
    from: 'user' | 'admin';
  }>();
  conversationNew$ = new Subject<any>();
  conversationStatus$ = new Subject<{
    conversationId: number;
    status: 'open' | 'closed';
  }>();
  unreadUpdate$ = new Subject<{ conversationId: number; unread: number }>();

  connect(token?: string) {
    if (this.socket) return;
    const url = environment.apiBase.replace('/api', '');
    this.socket = io(url, { query: token ? { token } : undefined });
    this.socket.on('message:new', (data) => this.messageNew$.next(data));
    this.socket.on('message:ack', (data) =>
      this.unreadUpdate$.next({
        conversationId: data?.conversationId,
        unread: undefined as any,
      })
    );
    this.socket.on('conversation:new', (data) =>
      this.conversationNew$.next(data)
    );
    this.socket.on('conversation:status', (data) =>
      this.conversationStatus$.next(data)
    );
    this.socket.on('unread:update', (data) => this.unreadUpdate$.next(data));
  }
}
