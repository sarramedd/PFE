package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByPerformedById(Long userId);

    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
}
