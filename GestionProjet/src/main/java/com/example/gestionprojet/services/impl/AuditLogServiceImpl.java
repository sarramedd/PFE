package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.AuditLog;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.AuditLogRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
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
        return auditLogRepository.findByPerformedById(userId);
    }

    @Override
    public List<AuditLog> getAuditLogsByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    public void deleteAuditLog(Long id) {
        AuditLog log = getAuditLogById(id);
        auditLogRepository.delete(log);
    }
}
