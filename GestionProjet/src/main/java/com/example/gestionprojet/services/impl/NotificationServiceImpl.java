package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Notification;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.NotificationRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.interfaces.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationServiceImpl implements NotificationService {
@Autowired
private NotificationRepository notificationRepository;
@Autowired
private UserRepository userRepository;
    @Override
    public Notification createNotification(Notification notification) {

        if (notification.getUser() != null) {
            User user = userRepository.findById(notification.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            notification.setUser(user);
        }

        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        return notificationRepository.save(notification);
    }

    @Override
    public Notification getNotificationById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
    }

    @Override
    public List<Notification> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    public Notification markAsRead(Long id) {
        Notification notification = getNotificationById(id);
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    @Override
    public void deleteNotification(Long id) {
        Notification notification = getNotificationById(id);
        notificationRepository.delete(notification);
    }
}
