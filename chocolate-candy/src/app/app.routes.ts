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
    path: 'orders/:id',
    loadComponent: () =>
      import('./pages/orders/order-detail.page').then((m) => m.OrderDetailPage),
    canMatch: [authGuard],
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.page').then((m) => m.CheckoutPage),
    canMatch: [authGuard],
  },
  {
    path: 'order-success/:id',
    loadComponent: () =>
      import('./pages/checkout/order-success.page').then(
        (m) => m.OrderSuccessPage
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
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product-detail.page').then(
        (m) => m.ProductDetailPage
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.page').then((m) => m.AdminPage),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/users',
    loadComponent: () =>
      import('./pages/admin/users.page').then((m) => m.AdminUsersPage),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/orders',
    loadComponent: () =>
      import('./pages/admin/orders.page').then((m) => m.AdminOrdersPage),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/products',
    loadComponent: () =>
      import('src/app/pages/admin/products.page').then(
        (m) => m.AdminProductsPage
      ),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/reports',
    loadComponent: () =>
      import('src/app/pages/admin/reports.page').then(
        (m) => m.AdminReportsPage
      ),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin/orders/:id',
    loadComponent: () =>
      import('./pages/admin/order-detail.page').then(
        (m) => m.AdminOrderDetailPage
      ),
    canMatch: [authGuard, roleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'auth',
    loadComponent: () => import('./auth/auth.page').then((m) => m.AuthPage),
  },
  {
    path: 'login',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: 'register',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full',
  },
];
