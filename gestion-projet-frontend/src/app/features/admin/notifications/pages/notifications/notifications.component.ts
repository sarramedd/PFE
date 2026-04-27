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
}
