package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Milestone;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.repositories.MilestoneRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MilestoneServiceImpl {
    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final TenantAccessService tenantAccessService;
    private final AuditLogServiceImpl auditLogService;

    public MilestoneServiceImpl(
            MilestoneRepository milestoneRepository,
            ProjectRepository projectRepository,
            TenantAccessService tenantAccessService,
            AuditLogServiceImpl auditLogService
    ) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.tenantAccessService = tenantAccessService;
        this.auditLogService = auditLogService;
    }

    public Milestone create(Milestone milestone) {
        tenantAccessService.assertCanManageProjects();
        milestone.setTitle(ValidationUtils.requireTrimmedText(milestone.getTitle(), "Milestone title", 2, 120));
        milestone.setDescription(ValidationUtils.optionalText(milestone.getDescription(), "Milestone description", 1000));
        ValidationUtils.validateFutureOrToday(milestone.getDueDate(), "Milestone due date");

        if (milestone.getProject() == null || milestone.getProject().getId() == null) {
            throw ValidationUtils.badRequest("Project is required.");
        }

        Project project = projectRepository.findByIdAndOrganizationId(
                        milestone.getProject().getId(),
                        tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Project not found in your organization"));

        milestone.setProject(project);
        milestone.setCreatedAt(LocalDateTime.now());
        Milestone created = milestoneRepository.save(milestone);
        auditLogService.record("MILESTONE_CREATED", "MILESTONE", created.getId());
        return created;
    }

    public List<Milestone> getByProject(Long projectId) {
        return milestoneRepository.findByProjectIdAndProject_Organization_IdOrderByDueDateAsc(
                projectId,
                tenantAccessService.getCurrentOrganizationId()
        );
    }

    public Milestone update(Long id, Milestone payload) {
        tenantAccessService.assertCanManageProjects();
        Milestone existing = milestoneRepository.findByIdAndProject_Organization_Id(id, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Milestone not found in your organization"));

        existing.setTitle(ValidationUtils.requireTrimmedText(payload.getTitle(), "Milestone title", 2, 120));
        existing.setDescription(ValidationUtils.optionalText(payload.getDescription(), "Milestone description", 1000));
        ValidationUtils.validateFutureOrToday(payload.getDueDate(), "Milestone due date");
        existing.setDueDate(payload.getDueDate());
        existing.setCompleted(payload.isCompleted());
        Milestone updated = milestoneRepository.save(existing);
        auditLogService.record("MILESTONE_UPDATED", "MILESTONE", updated.getId());
        return updated;
    }

    public void delete(Long id) {
        tenantAccessService.assertCanManageProjects();
        Milestone existing = milestoneRepository.findByIdAndProject_Organization_Id(id, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Milestone not found in your organization"));
        auditLogService.record("MILESTONE_DELETED", "MILESTONE", existing.getId());
        milestoneRepository.delete(existing);
    }
}
