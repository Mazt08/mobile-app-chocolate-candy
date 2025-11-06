export interface MenuItem {
  title: string;
  route?: string;
  icon?: string;
  badge?: number | string;
  show?: boolean;
  // Controls which users can see the item
  // 'any' (default), 'guest' (logged-out), or 'user' (logged-in)
  visibleFor?: 'any' | 'guest' | 'user';
  // Optional: restrict to specific roles when logged in
  visibleForRole?: Array<'admin' | 'staff' | 'user'>;
}

export interface MenuSection {
  label: string;
  items: MenuItem[];
}

// Grouped, Figma-inspired structure
export const APP_MENU_SECTIONS: MenuSection[] = [
  {
    label: 'Dashboard',
    items: [{ title: 'Home', route: '/home', icon: 'home-outline' }],
  },
  {
    label: 'Shop',
    items: [
      { title: 'Catalog', route: '/catalog', icon: 'library-outline' },
      {
        title: 'Special Offers',
        route: '/offers',
        icon: 'pricetag-outline',
        badge: 'New',
      },
      { title: 'Shopping Cart', route: '/cart', icon: 'bag-outline', badge: 0 },
    ],
  },
  {
    label: 'Activity',
    items: [{ title: 'My Orders', route: '/orders', icon: 'receipt-outline' }],
  },
  {
    label: 'Account',
    items: [
      // Guest-only actions
      {
        title: 'Login',
        route: '/login',
        icon: 'log-in-outline',
        visibleFor: 'guest',
      },
      {
        title: 'Register',
        route: '/register',
        icon: 'person-add-outline',
        visibleFor: 'guest',
      },
      // User-only actions
      {
        title: 'Profile',
        route: '/profile',
        icon: 'person-outline',
        visibleFor: 'user',
      },
      {
        title: 'Settings',
        route: '/settings',
        icon: 'settings-outline',
        visibleFor: 'user',
      },
      {
        title: 'Sign Out',
        route: 'logout',
        icon: 'log-out-outline',
        visibleFor: 'user',
      },
    ],
  },
  {
    label: 'Support',
    items: [
      { title: 'Help & FAQ', route: '/help', icon: 'help-circle-outline' },
      {
        title: 'About the App',
        route: '/about',
        icon: 'information-circle-outline',
      },
      { title: 'Developers', route: '/developers', icon: 'code-slash-outline' },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        title: 'Dashboard',
        route: '/admin',
        icon: 'speedometer-outline',
        visibleFor: 'user',
        visibleForRole: ['admin'],
      },
      {
        title: 'Users',
        route: '/admin/users',
        icon: 'people-outline',
        visibleFor: 'user',
        visibleForRole: ['admin'],
      },
    ],
  },
];

// Flatten if any legacy code still expects a flat list
// Avoid Array.prototype.flatMap for wider TS lib compatibility
export const FLAT_MENU: MenuItem[] = APP_MENU_SECTIONS.reduce(
  (acc: MenuItem[], section: MenuSection) => acc.concat(section.items),
  [] as MenuItem[]
);
