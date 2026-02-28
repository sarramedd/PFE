package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.AuditLog;

import java.util.List;

public interface AuditLogService {
    AuditLog createAuditLog(AuditLog auditLog);

    AuditLog getAuditLogById(Long id);

    List<AuditLog> getAuditLogsByUser(Long userId);

    List<AuditLog> getAuditLogsByEntity(String entityType, Long entityId);

    void deleteAuditLog(Long id);
}
