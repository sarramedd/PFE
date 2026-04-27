package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.NotificationPreference;
import com.example.gestionprojet.services.impl.NotificationPreferenceServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification-preferences")
public class NotificationPreferenceController {
    private final NotificationPreferenceServiceImpl notificationPreferenceService;

    public NotificationPreferenceController(NotificationPreferenceServiceImpl notificationPreferenceService) {
        this.notificationPreferenceService = notificationPreferenceService;
    }

    @GetMapping("/me")
    public ResponseEntity<NotificationPreference> getMine() {
        return ResponseEntity.ok(notificationPreferenceService.getMine());
    }

    @PutMapping("/me")
    public ResponseEntity<NotificationPreference> updateMine(@RequestBody NotificationPreference request) {
        return ResponseEntity.ok(notificationPreferenceService.updateMine(request));
    }
}
