import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { ApiService } from '../services/api.service';

export interface AuthUser {
  name: string;
  username?: string;
  email: string;
  avatar?: string | null;
  points?: number;
  isLoggedIn: boolean;
  role?: 'admin' | 'staff' | 'user';
  id?: number;
  token?: string;
}

const STORAGE_KEY = 'chocoexpressUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user$ = new BehaviorSubject<AuthUser | null>(null);
  public readonly user$ = this._user$.asObservable();

  constructor(private api: ApiService) {
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

  updateUser(patch: Partial<AuthUser>) {
    const curr = this._user$.value;
    if (!curr) return;
    const next = { ...curr, ...patch } as AuthUser;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    this._user$.next(next);
  }

  async login(identity: string, password: string) {
    // Calls backend to validate credentials; identity can be email or username
    const res = await firstValueFrom(this.api.login(identity, password));
    const user: AuthUser = {
      name: res.user?.name || res.user?.username || 'User',
      username: res.user?.username,
      email: res.user?.email,
      role: res.user?.role as any,
      id: res.user?.id,
      token: res.token,
      avatar: null,
      points: 50,
      isLoggedIn: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user$.next(user);
  }

  async register(
    name: string,
    username: string,
    email: string,
    password: string
  ) {
    const res = await firstValueFrom(
      this.api.register({ name, username, email, password })
    );
    const user: AuthUser = {
      name: res.user?.name,
      username: res.user?.username,
      email: res.user?.email,
      role: (res.user?.role as any) || 'user',
      id: res.user?.id,
      token: res.token,
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
