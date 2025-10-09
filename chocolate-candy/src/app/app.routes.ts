import { Routes } from '@angular/router';

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
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('My Orders')
      ),
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
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Settings')
      ),
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
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Login')
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./placeholders/generic.page').then((m) =>
        m.makePlaceholder('Register')
      ),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
