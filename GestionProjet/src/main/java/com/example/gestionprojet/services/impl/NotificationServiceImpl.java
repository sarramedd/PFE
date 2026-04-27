package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Notification;
import com.example.gestionprojet.entities.NotificationPreference;
import com.example.gestionprojet.entities.NotificationType;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.NotificationRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Service
public class NotificationServiceImpl implements NotificationService {
@Autowired
private NotificationRepository notificationRepository;
@Autowired
private UserRepository userRepository;
@Autowired
private TenantAccessService tenantAccessService;
@Autowired
private NotificationPreferenceServiceImpl notificationPreferenceService;
    @Override
    public Notification createNotification(Notification notification) {

        if (notification.getUser() != null) {
            User user = tenantAccessService.isSuperAdmin()
                    ? userRepository.findById(notification.getUser().getId())
                        .orElseThrow(() -> new RuntimeException("User not found"))
                    : userRepository.findByIdAndOrganizationId(notification.getUser().getId(), tenantAccessService.getCurrentOrganizationId())
                        .orElseThrow(() -> new RuntimeException("User not found in your organization"));
            notification.setUser(user);
        }

        if (notification.getMessage() == null || notification.getMessage().trim().isEmpty()) {
            throw new RuntimeException("Notification message is required");
        }

        notification.setMessage(notification.getMessage().trim());
        notification.setCreatedAt(LocalDateTime.now());
        if (notification.getType() == null) {
            notification.setType(NotificationType.GENERAL);
        }
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    @Override
    public Notification getNotificationById(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!tenantAccessService.isSuperAdmin()) {
            tenantAccessService.validateSameOrganization(notification.getUser());
            if (!notification.getUser().getId().equals(tenantAccessService.getCurrentUserId())) {
                throw new RuntimeException("You can only access your own notifications");
            }
        }

        return notification;
    }

    @Override
    public List<Notification> getNotificationsByUser(Long userId) {
        if (!tenantAccessService.isSuperAdmin()) {
            if (!tenantAccessService.getCurrentUserId().equals(userId)) {
                throw new RuntimeException("You can only access your own notifications");
            }
        }

        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsByType(Long userId, NotificationType type) {
        if (!tenantAccessService.isSuperAdmin() && !tenantAccessService.getCurrentUserId().equals(userId)) {
            throw new RuntimeException("You can only access your own notifications");
        }
        return notificationRepository.findByUserIdAndTypeOrderByCreatedAtDesc(userId, type);
    }

    @Override
    public void deleteNotification(Long id) {
        Notification notification = getNotificationById(id);
        notificationRepository.delete(notification);
    }

    @Override
    public Notification createForUser(User user, String message) {
        return createForUser(user, message, NotificationType.GENERAL);
    }

    @Override
    public Notification createForUser(User user, String message, NotificationType type) {
        if (user == null) {
            return null;
        }

        NotificationPreference preference = notificationPreferenceService.getOrCreateForUser(user);
        if (!preference.isInAppEnabled()) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type == null ? NotificationType.GENERAL : type);
        return createNotification(notification);
    }

    @Override
    public void notifyUsers(Collection<User> users, String message, Long excludedUserId) {
        notifyUsers(users, message, excludedUserId, NotificationType.GENERAL);
    }

    @Override
    public void notifyUsers(Collection<User> users, String message, Long excludedUserId, NotificationType type) {
        if (users == null || users.isEmpty()) {
            return;
        }

        String sanitizedMessage = message == null ? "" : message.trim();
        if (sanitizedMessage.isEmpty()) {
            return;
        }

        users.stream()
                .filter(Objects::nonNull)
                .filter(user -> excludedUserId == null || !excludedUserId.equals(user.getId()))
                .forEach(user -> {
                    NotificationPreference preference = notificationPreferenceService.getOrCreateForUser(user);
                    if (!preference.isInAppEnabled()) {
                        return;
                    }

                    Notification notification = new Notification();
                    notification.setUser(user);
                    notification.setMessage(sanitizedMessage);
                    notification.setType(type == null ? NotificationType.GENERAL : type);
                    notification.setCreatedAt(LocalDateTime.now());
                    notification.setRead(false);
                    notificationRepository.save(notification);
                });
    }
}
