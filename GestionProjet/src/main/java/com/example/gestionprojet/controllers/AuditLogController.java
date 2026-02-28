package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.AuditLog;
import com.example.gestionprojet.services.impl.AuditLogServiceImpl;
import com.example.gestionprojet.services.interfaces.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    @Autowired
    private AuditLogServiceImpl auditLogService;
    @PostMapping
    public ResponseEntity<AuditLog> createAuditLog(@RequestBody AuditLog auditLog) {
        AuditLog created = auditLogService.createAuditLog(auditLog);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLog> getAuditLogById(@PathVariable Long id) {
        AuditLog log = auditLogService.getAuditLogById(id);
        return new ResponseEntity<>(log, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLog>> getAuditLogsByUser(@PathVariable Long userId) {
        List<AuditLog> logs = auditLogService.getAuditLogsByUser(userId);
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }

    @GetMapping("/entity")
    public ResponseEntity<List<AuditLog>> getAuditLogsByEntity(
            @RequestParam String entityType,
            @RequestParam Long entityId) {
        List<AuditLog> logs = auditLogService.getAuditLogsByEntity(entityType, entityId);
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuditLog(@PathVariable Long id) {
        auditLogService.deleteAuditLog(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
