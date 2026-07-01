package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Notification;
import com.example.gestionprojet.entities.NotificationType;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.impl.NotificationServiceImpl;
import com.example.gestionprojet.services.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    @Autowired
    private NotificationServiceImpl notificationService;
    @Autowired
    private TenantAccessService tenantAccessService;
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification created = notificationService.createNotification(notification);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        Notification notification = notificationService.getNotificationById(id);
        return new ResponseEntity<>(notification, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getNotificationsByUser(@PathVariable Long userId) {
        List<Notification> notifications = notificationService.getNotificationsByUser(userId);
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        List<Notification> notifications = notificationService.getNotificationsByUser(tenantAccessService.getCurrentUserId());
        return new ResponseEntity<>(notifications, HttpStatus.OK);
    }

    @GetMapping("/me/type/{type}")
    public ResponseEntity<List<Notification>> getMyNotificationsByType(@PathVariable NotificationType type) {
        return new ResponseEntity<>(notificationService.getNotificationsByType(tenantAccessService.getCurrentUserId(), type), HttpStatus.OK);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable Long id) {
        Notification updated = notificationService.markAsRead(id);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PatchMapping("/me/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead(tenantAccessService.getCurrentUserId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}
