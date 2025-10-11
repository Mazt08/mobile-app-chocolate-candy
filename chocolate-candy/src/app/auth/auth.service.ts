import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface AuthUser {
  name: string;
  username?: string;
  email: string;
  avatar?: string | null;
  points?: number;
  isLoggedIn: boolean;
}

const STORAGE_KEY = 'chocoexpressUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthUser | null>(null);
  public readonly user$ = this._user$.asObservable();

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this._user$.next(JSON.parse(saved));
      } catch {}
    }
  }

  get user(): AuthUser | null {
    return this._user$.value;
  }

  login(email: string, _password: string) {
    // Demo only: accept any email/password
    const name = email.split('@')[0];
    const user: AuthUser = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      email,
      avatar: null,
      points: 50,
      isLoggedIn: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  register(name: string, username: string, email: string, _password: string) {
    const user: AuthUser = {
      name,
      username,
      email,
      avatar: null,
      points: 0,
      isLoggedIn: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this._user$.next({
      name: 'Guest User',
      email: 'guest@chocoexpress.com',
      avatar: null,
      points: 0,
      isLoggedIn: false,
    });
  }
}
