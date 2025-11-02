import { inject } from '@angular/core';
import { CanMatchFn, Router, Route, UrlSegment } from '@angular/router';

function getUser() {
  try {
    const saved = localStorage.getItem('chocoexpressUser');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const roleGuard: CanMatchFn = (
  route: Route,
  _segments: UrlSegment[]
) => {
  const router = inject(Router);
  const user = getUser();
  const roles: string[] =
    (route.data && (route.data['roles'] as string[])) || [];
  if (!roles.length) return true;
  if (user?.isLoggedIn && roles.includes(user.role)) return true;
  return router.createUrlTree(['/login']);
};
