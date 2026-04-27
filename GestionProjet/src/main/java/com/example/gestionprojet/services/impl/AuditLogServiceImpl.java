package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.AuditLog;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.AuditLogRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class AuditLogServiceImpl implements AuditLogService {
@Autowired
private AuditLogRepository auditLogRepository;
@Autowired
private UserRepository userRepository;
@Autowired
private ProjectRepository projectRepository;
@Autowired
private TaskRepository taskRepository;
@Autowired
private TenantAccessService tenantAccessService;


    @Override
    public AuditLog createAuditLog(AuditLog auditLog) {

        if (auditLog.getPerformedBy() != null) {
            User user = userRepository.findById(auditLog.getPerformedBy().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            auditLog.setPerformedBy(user);
        }

        auditLog.setTimestamp(LocalDateTime.now());

        return auditLogRepository.save(auditLog);
    }

    @Override
    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AuditLog not found"));
    }

    @Override
    public List<AuditLog> getAuditLogsByUser(Long userId) {
        return auditLogRepository.findByPerformedByIdOrderByTimestampDesc(userId);
    }

    @Override
    public List<AuditLog> getAuditLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }

    @Override
    public void deleteAuditLog(Long id) {
        AuditLog log = getAuditLogById(id);
        auditLogRepository.delete(log);
    }

    public AuditLog record(String action, String entityType, Long entityId) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setPerformedBy(tenantAccessService.getCurrentUser());
        auditLog.setTimestamp(LocalDateTime.now());
        return auditLogRepository.save(auditLog);
    }

    public List<AuditLog> getMyActivity() {
        return auditLogRepository.findByPerformedByIdOrderByTimestampDesc(tenantAccessService.getCurrentUserId());
    }

    public List<AuditLog> getTeamActivity() {
        if (tenantAccessService.isSuperAdmin()) {
            return auditLogRepository.findAll().stream()
                    .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                    .toList();
        }

        return auditLogRepository.findByPerformedBy_Organization_IdOrderByTimestampDesc(
                tenantAccessService.getCurrentOrganizationId()
        );
    }
}
