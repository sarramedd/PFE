export interface NotificationPreference {
  id: number;
  inAppEnabled: boolean;
  emailEnabled: boolean;
  dailyDigestEnabled: boolean;
  dueReminderEnabled: boolean;
  overloadAlertEnabled: boolean;
  automationEnabled: boolean;
}
