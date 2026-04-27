package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.NotificationPreference;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.NotificationPreferenceRepository;
import com.example.gestionprojet.security.TenantAccessService;
import org.springframework.stereotype.Service;

@Service
public class NotificationPreferenceServiceImpl {
    private final NotificationPreferenceRepository notificationPreferenceRepository;
    private final TenantAccessService tenantAccessService;

    public NotificationPreferenceServiceImpl(
            NotificationPreferenceRepository notificationPreferenceRepository,
            TenantAccessService tenantAccessService
    ) {
        this.notificationPreferenceRepository = notificationPreferenceRepository;
        this.tenantAccessService = tenantAccessService;
    }

    public NotificationPreference getMine() {
        return getOrCreateForUser(tenantAccessService.getCurrentUser());
    }

    public NotificationPreference updateMine(NotificationPreference request) {
        NotificationPreference preference = getMine();
        preference.setInAppEnabled(request.isInAppEnabled());
        preference.setEmailEnabled(request.isEmailEnabled());
        preference.setDailyDigestEnabled(request.isDailyDigestEnabled());
        preference.setDueReminderEnabled(request.isDueReminderEnabled());
        preference.setOverloadAlertEnabled(request.isOverloadAlertEnabled());
        preference.setAutomationEnabled(request.isAutomationEnabled());
        return notificationPreferenceRepository.save(preference);
    }

    public NotificationPreference getOrCreateForUser(User user) {
        return notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    NotificationPreference preference = new NotificationPreference();
                    preference.setUser(user);
                    return notificationPreferenceRepository.save(preference);
                });
    }
}
