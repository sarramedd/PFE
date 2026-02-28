package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.Notification;

import java.util.List;

public interface NotificationService {
    Notification createNotification(Notification notification);

    Notification getNotificationById(Long id);

    List<Notification> getNotificationsByUser(Long userId);

    Notification markAsRead(Long id);

    void deleteNotification(Long id);
}
