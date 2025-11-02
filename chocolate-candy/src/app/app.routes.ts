import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog.page').then((m) => m.CatalogPage),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./pages/categories/categories.page').then(
        (m) => m.CategoriesPage
      ),
  },
  {
    path: 'offers',
    loadComponent: () =>
      import('./pages/offers/offers.page').then((m) => m.OffersPage),
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
      import('./pages/cart/cart.page').then((m) => m.CartPage),
    canMatch: [authGuard],
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./pages/orders/orders.page').then((m) => m.OrdersPage),
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
      import('./pages/profile/profile.page').then((m) => m.ProfilePage),
    canMatch: [authGuard],
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
    canMatch: [authGuard],
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./pages/help/help.page').then((m) => m.HelpPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./about/about.page').then((m) => m.AboutPage),
  },
  {
    path: 'developers',
    loadComponent: () =>
      import('./pages/developers/developers.page').then(
        (m) => m.DevelopersPage
      ),
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users.page').then((m) => m.AdminUsersPage),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
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
