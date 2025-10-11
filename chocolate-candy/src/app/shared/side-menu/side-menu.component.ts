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
    private auth: AuthService
  ) {}

  ngOnInit() {
    // Update cart badge in real-time
    this.updateCartBadge();

    // Load user data if available and subscribe for changes
    this.loadUserData();
    this.auth.user$.pipe(takeUntil(this.destroy$)).subscribe((u) => {
      if (u) {
        this.user = u;
      }
      this.sections = this.filterSectionsByVisibility(APP_MENU_SECTIONS);
    });

    // Apply responsive collapse if wide screen (desktop preview scenario)
    this.applyAutoResponsive();
    window.addEventListener('resize', this.applyAutoResponsiveBound);
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
      this.router.navigate(['/login']);
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

  private loadUserData() {
    // This would typically load from a user service or storage
    // For demo purposes, we'll use mock data
    const savedUser = localStorage.getItem('chocoexpressUser');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    }

    // After loading user state, filter visible sections
    this.sections = this.filterSectionsByVisibility(APP_MENU_SECTIONS);
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
    return sections.map((section) => ({
      label: section.label,
      items: section.items.filter((item) => {
        const vis = item.visibleFor || 'any';
        if (vis === 'any') return true;
        if (vis === 'guest') return !isLoggedIn;
        if (vis === 'user') return isLoggedIn;
        return true;
      }),
    }));
  }
}
