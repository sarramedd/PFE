package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.Notification;
import com.example.gestionprojet.entities.NotificationType;
import com.example.gestionprojet.entities.User;

import java.util.Collection;
import java.util.List;

public interface NotificationService {
    Notification createNotification(Notification notification);

    Notification getNotificationById(Long id);

    List<Notification> getNotificationsByUser(Long userId);

    Notification markAsRead(Long id);

    void deleteNotification(Long id);

    Notification createForUser(User user, String message);
    Notification createForUser(User user, String message, NotificationType type);

    void notifyUsers(Collection<User> users, String message, Long excludedUserId);
    void notifyUsers(Collection<User> users, String message, Long excludedUserId, NotificationType type);
}
