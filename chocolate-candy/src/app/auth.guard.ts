import { inject } from '@angular/core';
import { CanMatchFn, Router, UrlSegment } from '@angular/router';

function isLoggedIn(): boolean {
  try {
    const saved = localStorage.getItem('chocoexpressUser');
    if (!saved) return false;
    const u = JSON.parse(saved);
    return !!u?.isLoggedIn;
  } catch {
    return false;
  }
}

export const authGuard: CanMatchFn = (route, segments: UrlSegment[]) => {
  const router = inject(Router);
  if (isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
