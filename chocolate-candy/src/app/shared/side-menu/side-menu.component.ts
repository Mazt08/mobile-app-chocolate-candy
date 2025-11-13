import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonMenu,
  IonContent,
  IonAvatar,
  IonIcon,
  IonList,
  IonBadge,
  IonText,
  MenuController,
} from '@ionic/angular/standalone';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  APP_MENU_SECTIONS,
  MenuSection,
  MenuItem,
  FLAT_MENU,
} from './menu-items';
import { AuthService } from '../../auth/auth.service';
import { CartService } from '../../cart/cart.service';
import { ApiService } from '../../services/api.service';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu-compact.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonMenu,
    IonContent,
    IonAvatar,
    IonIcon,
    IonList,
    IonBadge,
    IonText,
  ],
})
export class SideMenuComponent implements OnInit, OnDestroy {
  sections: MenuSection[] = APP_MENU_SECTIONS;
  // Keep a flat list for lookups (badge updates, active checks)
  menuItems: MenuItem[] = FLAT_MENU;
  user: any = {
    name: 'Guest User',
    email: 'guest@chocoexpress.com',
    avatar: null,
    points: 0,
    isLoggedIn: false,
  };

  cartCount = 0;
  defaultAvatar = 'assets/icon/user-avatar.svg';
  private destroy$ = new Subject<void>();
  collapsed = false; // compact visual mode
  autoResponsiveApplied = false;

  @HostBinding('class.collapsed') get hostCollapsed() {
    return this.collapsed;
  }

  constructor(
    private router: Router,
    private menuController: MenuController,
    private auth: AuthService,
    private cart: CartService,
    private api: ApiService,
    private socket: SocketService
  ) {}

  ngOnInit() {
    // Update cart badge in real-time
    this.updateCartBadge();

    // Load user data if available and subscribe for changes
    this.loadUserData();
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe((u) => {
      if (u) {
        this.user = u;
        // connect socket once authenticated (token stored in auth service)
        if (u.token) {
          this.socket.connect(u.token);
        }
      } else {
        this.user = {
          name: 'Guest User',
          email: 'guest@chocoexpress.com',
          avatar: null,
          points: 0,
          isLoggedIn: false,
        };
      }
      this.sections = this.filterSectionsByVisibility(APP_MENU_SECTIONS);
      this.refreshUnreadBadge();
    });

    // Socket-driven unread refresh triggers
    this.socket.messageNew$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.refreshUnreadBadge();
    });
    this.socket.conversationNew$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshUnreadBadge());
    this.socket.unreadUpdate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshUnreadBadge());

    // Apply responsive collapse if wide screen (desktop preview scenario)
    this.applyAutoResponsive();
    window.addEventListener('resize', this.applyAutoResponsiveBound);

    // Cart badge updates
    this.cart.count$.pipe(takeUntil(this.destroy$)).subscribe((count) => {
      this.cartCount = count;
      this.updateCartBadge();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.applyAutoResponsiveBound);
  }

  async navigate(item: MenuItem) {
    if (item.route) {
      // Intercept logout sentinel
      if (item.route === 'logout') {
        await this.logout();
        return;
      }
      // Only auto-close on small viewports or when not collapsed navigation mode
      if (window.innerWidth < 992) {
        await this.menuController.close('main-menu');
      }
      this.router.navigate([item.route]);
    }
  }

  isActive(item: MenuItem): boolean {
    if (!item.route) return false;
    return (
      this.router.url === item.route ||
      this.router.url.startsWith(item.route + '/')
    );
  }

  displayBadge(badge: number | string): string {
    if (typeof badge === 'number') {
      return badge > 99 ? '99+' : badge.toString();
    }
    return badge;
  }

  async goToProfile() {
    await this.menuController.close('main-menu');
    if (this.user.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.router.navigate(['/auth']);
    }
  }

  async logout() {
    // Implement logout logic here
    this.auth.logout();

    await this.menuController.close('main-menu');
    // Refresh menu visibility for guest
    this.sections = this.filterSectionsByVisibility(APP_MENU_SECTIONS);
    this.router.navigate(['/home']);
  }

  private updateCartBadge() {
    const cartItem = this.menuItems.find((i) => i.route === '/cart');
    if (cartItem) cartItem.badge = this.cartCount;
  }

  private refreshUnreadBadge() {
    if (!this.user?.isLoggedIn) {
      // reset badges
      const userMsg = this.menuItems.find((i) => i.route === '/messages');
      if (userMsg) userMsg.badge = undefined;
      const adminMsg = this.menuItems.find(
        (i) => i.route === '/admin/messages'
      );
      if (adminMsg) adminMsg.badge = undefined;
      return;
    }
    const role = this.user.role;
    if (role === 'admin') {
      this.api
        .getAdminUnreadCount()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (r) => {
            const adminMsg = this.menuItems.find(
              (i) => i.route === '/admin/messages'
            );
            if (adminMsg) adminMsg.badge = r.unread;
          },
        });
    } else {
      this.api
        .getUserUnreadCount()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (r) => {
            const userMsg = this.menuItems.find((i) => i.route === '/messages');
            if (userMsg) userMsg.badge = r.unread;
          },
        });
    }
  }

  private loadUserData() {
    // Load from local storage if available
    const savedUser = localStorage.getItem('chocoexpressUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    // After loading user state, filter visible sections
    this.sections = this.filterSectionsByVisibility(APP_MENU_SECTIONS);
    this.refreshUnreadBadge();
  }

  getProfileSubtitle(): string {
    if (this.user.isLoggedIn) {
      return this.user.points > 0
        ? `${this.user.points} Choco Points`
        : 'Welcome back!';
    }
    return 'Sign in for exclusive offers';
  }

  shouldShowBadge(item: MenuItem): boolean {
    if (item.badge === undefined || item.badge === null) return false;
    if (typeof item.badge === 'number') return item.badge > 0;
    return true;
  }

  toggleCollapsed(e?: Event) {
    if (e) {
      e.stopPropagation();
    }
    this.collapsed = !this.collapsed;
  }

  private applyAutoResponsive() {
    // Collapse when width >= 1200 for a dashboard-like feel; expand otherwise
    const shouldCollapse = window.innerWidth >= 1200;
    this.collapsed = shouldCollapse;
  }

  // Bound reference for add/remove event listener
  private applyAutoResponsiveBound = () => this.applyAutoResponsive();

  private filterSectionsByVisibility(sections: MenuSection[]): MenuSection[] {
    const isLoggedIn = !!this.user?.isLoggedIn;
    const role = this.user?.role as 'admin' | 'staff' | 'user' | undefined;
    // If admin, show only the required admin items
    if (isLoggedIn && role === 'admin') {
      const adminOnly: MenuSection[] = [
        {
          label: 'Admin',
          items: [
            {
              title: 'Dashboard',
              route: '/admin',
              icon: 'speedometer-outline',
            },
            {
              title: 'User Management',
              route: '/admin/users',
              icon: 'people-outline',
            },
            {
              title: 'Reports',
              route: '/admin/reports',
              icon: 'bar-chart-outline',
            },
            {
              title: 'Orders',
              route: '/admin/orders',
              icon: 'receipt-outline',
            },
            {
              title: 'Products',
              route: '/admin/products',
              icon: 'cube-outline',
            },
            {
              title: 'Messages',
              route: '/admin/messages',
              icon: 'chatbubbles-outline',
            },
            {
              title: 'Sign Out',
              route: 'logout',
              icon: 'log-out-outline',
            },
          ],
        },
      ];
      return adminOnly;
    }
    // For non-admins/guests: hide empty sections and always drop the 'Admin' section label
    const filtered = sections
      .map((section) => {
        // Skip the Admin section entirely for non-admins
        if (section.label === 'Admin') {
          return { label: section.label, items: [] as MenuItem[] };
        }
        const items = section.items.filter((item) => {
          const vis = item.visibleFor || 'any';
          if (vis === 'any') return true;
          if (vis === 'guest') return !isLoggedIn;
          if (vis === 'user') {
            if (!isLoggedIn) return false;
            if (item.visibleForRole && role) {
              return item.visibleForRole.includes(role as any);
            }
            return !item.visibleForRole;
          }
          return true;
        });
        return { label: section.label, items } as MenuSection;
      })
      .filter((section) => section.items.length > 0);
    return filtered;
  }
}
