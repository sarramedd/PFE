import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationPreferenceService } from 'src/app/core/services/notification-preference.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { NotificationItem } from 'src/app/shared/models/notification.model';
import { NotificationPreference } from 'src/app/shared/models/notification-preference.model';

type NotificationTypeFilter = 'ALL' | NonNullable<NotificationItem['type']>;

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  allNotifications: NotificationItem[] = [];
  notifications: NotificationItem[] = [];
  preference: NotificationPreference | null = null;
  loading = true;
  saving = false;
  filter: NotificationTypeFilter = 'ALL';
  message = '';
  private notificationsSub: Subscription | null = null;

  readonly types: Array<{ label: string; value: NotificationTypeFilter }> = [
    { label: 'Toutes', value: 'ALL' },
    { label: 'Task', value: 'TASK_UPDATE' },
    { label: 'Mentions', value: 'COMMENT_MENTION' },
    { label: 'Rappels', value: 'DUE_REMINDER' },
    { label: 'Surcharge', value: 'OVERLOAD_ALERT' },
    { label: 'Digest', value: 'DAILY_DIGEST' },
    { label: 'Automations', value: 'AUTOMATION' }
  ];

  constructor(
    private notificationService: NotificationService,
    private preferenceService: NotificationPreferenceService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadPreferences();
  }

  ngOnDestroy(): void {
    this.notificationsSub?.unsubscribe();
  }

  get unreadCount(): number {
    return this.allNotifications.filter((item) => !item.isRead).length;
  }

  get readCount(): number {
    return this.allNotifications.filter((item) => item.isRead).length;
  }

  get automationCount(): number {
    return this.allNotifications.filter((item) => item.type === 'AUTOMATION').length;
  }

  get mentionCount(): number {
    return this.allNotifications.filter((item) => item.type === 'COMMENT_MENTION').length;
  }

  loadNotifications(): void {
    this.loading = true;
    this.notificationsSub?.unsubscribe();
    this.notificationsSub = this.notificationService.watchMineLive().subscribe({
      next: (items) => {
        this.allNotifications = items;
        this.applyFilter(this.filter, false);
        this.loading = false;
      },
      error: () => {
        this.allNotifications = [];
        this.notifications = [];
        this.loading = false;
      }
    });
  }

  loadPreferences(): void {
    this.preferenceService.getMine().subscribe({
      next: (pref) => {
        this.preference = pref;
      }
    });
  }

  applyFilter(filter: NotificationTypeFilter, updateCurrent = true): void {
    if (updateCurrent) {
      this.filter = filter;
    }

    this.notifications = this.filter === 'ALL'
      ? [...this.allNotifications]
      : this.allNotifications.filter((item) => item.type === this.filter);
  }

  savePreferences(): void {
    if (!this.preference) {
      return;
    }

    this.saving = true;
    this.message = '';
    this.preferenceService.updateMine(this.preference).subscribe({
      next: (pref) => {
        this.preference = pref;
        this.message = 'Preferences sauvegardees.';
        this.saving = false;
      },
      error: () => {
        this.message = 'Echec sauvegarde preferences.';
        this.saving = false;
      }
    });
  }

  markAsRead(item: NotificationItem): void {
    if (item.isRead) {
      return;
    }
    this.notificationService.markAsRead(item.id).subscribe({
      next: () => {
        item.isRead = true;
      }
    });
  }

  typeLabel(type?: NotificationItem['type']): string {
    switch (type) {
      case 'TASK_UPDATE':
        return 'Task update';
      case 'COMMENT_MENTION':
        return 'Mention';
      case 'DUE_REMINDER':
        return 'Deadline';
      case 'OVERLOAD_ALERT':
        return 'Overload';
      case 'DAILY_DIGEST':
        return 'Digest';
      case 'AUTOMATION':
        return 'Automation';
      default:
        return 'General';
    }
  }

  typeIcon(type?: NotificationItem['type']): string {
    switch (type) {
      case 'TASK_UPDATE':
        return 'mdi-clipboard-check-outline';
      case 'COMMENT_MENTION':
        return 'mdi-at';
      case 'DUE_REMINDER':
        return 'mdi-calendar-alert';
      case 'OVERLOAD_ALERT':
        return 'mdi-alert-octagon-outline';
      case 'DAILY_DIGEST':
        return 'mdi-email-newsletter';
      case 'AUTOMATION':
        return 'mdi-creation-outline';
      default:
        return 'mdi-bell-outline';
    }
  }

  typeTone(type?: NotificationItem['type']): string {
    switch (type) {
      case 'TASK_UPDATE':
        return 'tone-task';
      case 'COMMENT_MENTION':
        return 'tone-mention';
      case 'DUE_REMINDER':
        return 'tone-reminder';
      case 'OVERLOAD_ALERT':
        return 'tone-alert';
      case 'DAILY_DIGEST':
        return 'tone-digest';
      case 'AUTOMATION':
        return 'tone-automation';
      default:
        return 'tone-general';
    }
  }
}
