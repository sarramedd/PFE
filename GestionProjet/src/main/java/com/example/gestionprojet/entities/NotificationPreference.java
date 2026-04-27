package com.example.gestionprojet.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "notification_preferences")
public class NotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private boolean inAppEnabled = true;

    private boolean emailEnabled = false;

    private boolean dailyDigestEnabled = true;

    private boolean dueReminderEnabled = true;

    private boolean overloadAlertEnabled = true;

    private boolean automationEnabled = true;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isInAppEnabled() {
        return inAppEnabled;
    }

    public void setInAppEnabled(boolean inAppEnabled) {
        this.inAppEnabled = inAppEnabled;
    }

    public boolean isEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }

    public boolean isDailyDigestEnabled() {
        return dailyDigestEnabled;
    }

    public void setDailyDigestEnabled(boolean dailyDigestEnabled) {
        this.dailyDigestEnabled = dailyDigestEnabled;
    }

    public boolean isDueReminderEnabled() {
        return dueReminderEnabled;
    }

    public void setDueReminderEnabled(boolean dueReminderEnabled) {
        this.dueReminderEnabled = dueReminderEnabled;
    }

    public boolean isOverloadAlertEnabled() {
        return overloadAlertEnabled;
    }

    public void setOverloadAlertEnabled(boolean overloadAlertEnabled) {
        this.overloadAlertEnabled = overloadAlertEnabled;
    }

    public boolean isAutomationEnabled() {
        return automationEnabled;
    }

    public void setAutomationEnabled(boolean automationEnabled) {
        this.automationEnabled = automationEnabled;
    }
}
