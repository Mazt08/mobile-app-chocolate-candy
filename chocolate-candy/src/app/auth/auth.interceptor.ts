import { HttpInterceptorFn } from '@angular/common/http';

const STORAGE_KEY = 'chocoexpressUser';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const u = JSON.parse(saved);
      const token = u?.token as string | undefined;
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    }
  } catch {}
  return next(req);
};
