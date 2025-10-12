import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_STORAGE_KEY = 'choco_theme_pref_v1';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private pref$ = new BehaviorSubject<ThemePreference>('system');
  readonly preference$ = this.pref$.asObservable();
  private media: MediaQueryList | null = null;

  constructor() {
    // Lazy init on first use; constructor kept light
  }

  init() {
    // Load saved preference or default to system
    const saved = (localStorage.getItem(THEME_STORAGE_KEY) ||
      'system') as ThemePreference;
    this.setPreference(saved);
  }

  setPreference(pref: ThemePreference) {
    this.pref$.next(pref);
    localStorage.setItem(THEME_STORAGE_KEY, pref);
    this.apply(pref);
  }

  getPreference(): ThemePreference {
    return this.pref$.value;
  }

  private apply(pref: ThemePreference) {
    const body = document.body;
    // Cleanup media listener if any
    if (this.media) {
      this.media.onchange = null;
      this.media = null;
    }

    if (pref === 'dark') {
      body.classList.add('dark');
    } else if (pref === 'light') {
      body.classList.remove('dark');
    } else {
      // system
      this.media = window.matchMedia('(prefers-color-scheme: dark)');
      const setFromSystem = () => {
        if (this.media!.matches) body.classList.add('dark');
        else body.classList.remove('dark');
      };
      setFromSystem();
      this.media.onchange = () => setFromSystem();
    }
  }
}
