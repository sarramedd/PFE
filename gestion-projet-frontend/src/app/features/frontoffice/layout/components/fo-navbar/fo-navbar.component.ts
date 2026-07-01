import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { NotificationItem } from 'src/app/shared/models/notification.model';
import { Organization } from 'src/app/shared/models/organization.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-fo-navbar',
  templateUrl: './fo-navbar.component.html',
  styleUrls: ['./fo-navbar.component.css']
})
export class FoNavbarComponent implements OnDestroy {
  readonly user$: Observable<User | null>;
  notifications: NotificationItem[] = [];
  loadingNotifications = false;
  showNotifications = false;
  currentUser: User | null = null;
  currentOrganization: Organization | null = null;
  currentOrganizationLogoFromUser: string | null = null;
  private notificationsSub: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private currentUserService: CurrentUserService,
    private notificationService: NotificationService,
    private userService: UserService,
    private organizationService: OrganizationService,
    private router: Router
  ) {
    this.user$ = this.currentUserService.user$;
    this.currentUserService.user$.subscribe((user) => {
      this.currentUser = user;

      if (user?.id) {
        this.currentOrganizationLogoFromUser = this.organizationService.resolveLogoUrl(user.organizationLogoUrl);
        this.startLiveNotifications();
        this.loadOrganization(user.organizationId);
      } else {
        this.notifications = [];
        this.currentOrganization = null;
        this.currentOrganizationLogoFromUser = null;
        this.notificationsSub?.unsubscribe();
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationsSub?.unsubscribe();
    this.notificationService.disconnectLive();
  }

  get isAdmin(): boolean {
    return this.authService.isAdminUser();
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead).length;
  }

  get avatarUrl(): string | null {
    return this.userService.resolveAvatarUrl(this.currentUser?.avatarUrl);
  }

  get organizationLogoUrl(): string | null {
    return this.currentOrganizationLogoFromUser || this.organizationService.resolveLogoUrl(this.currentOrganization?.logoUrl);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;

    if (this.showNotifications) {
      // Au bout de 1,2s, marquer toutes les notifs affichees comme lues
      // (laisse le temps a l'utilisateur de voir le badge "non lu").
      setTimeout(() => this.markAllVisibleAsRead(), 1200);
    }
  }

  /** Marque TOUTES les notifs comme lues via un seul appel backend. */
  markAllVisibleAsRead(): void {
    const hasUnread = this.notifications.some((n) => !n.isRead);
    if (!hasUnread) return;
    this.notificationService.markAllAsRead().subscribe();
  }

  loadNotifications(): void {
    this.startLiveNotifications();
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
      }
    });
  }

  private markVisibleNotificationsAsRead(): void {
    const unreadIds = this.notifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification.id);

    if (unreadIds.length === 0) {
      return;
    }

    this.notifications = this.notifications.map((notification) => ({
      ...notification,
      isRead: true
    }));

    this.notificationService.markManyAsRead(unreadIds);
  }

  formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  logout(): void {
    this.notificationService.disconnectLive();
    this.authService.logout();
    this.currentUserService.clear();
    this.router.navigateByUrl('/login');
  }

  private loadOrganization(organizationId?: number): void {
    if (!organizationId) {
      this.currentOrganization = null;
      return;
    }

    this.organizationService.getMine().subscribe({
      next: (organization) => {
        this.currentOrganization = organization?.id === organizationId ? organization : null;
      },
      error: () => {
        this.currentOrganization = null;
      }
    });
  }

  private startLiveNotifications(): void {
    this.loadingNotifications = true;
    this.notificationsSub?.unsubscribe();
    this.notificationsSub = this.notificationService.watchMineLive().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loadingNotifications = false;
      },
      error: () => {
        this.notifications = [];
        this.loadingNotifications = false;
      }
    });
  }
}
