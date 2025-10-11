import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Catalog')
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Categories')
      ),
  },
  {
    path: 'offers',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Special Offers')
      ),
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Favorites')
      ),
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Shopping Cart')
      ),
    canMatch: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('My Orders')
      ),
    canMatch: [authGuard],
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Notifications')
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Profile')
      ),
    canMatch: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Settings')
      ),
    canMatch: [authGuard],
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Help & FAQ')
      ),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'developers',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Developers')
      ),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register.page').then((m) => m.RegisterPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
