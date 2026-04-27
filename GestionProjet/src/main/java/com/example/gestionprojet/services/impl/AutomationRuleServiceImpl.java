package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.*;
import com.example.gestionprojet.repositories.AutomationRuleRepository;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AutomationRuleServiceImpl {
    private final AutomationRuleRepository automationRuleRepository;
    private final TenantAccessService tenantAccessService;
    private final NotificationServiceImpl notificationService;
    private final TaskRepository taskRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final AuditLogServiceImpl auditLogService;

    public AutomationRuleServiceImpl(
            AutomationRuleRepository automationRuleRepository,
            TenantAccessService tenantAccessService,
            NotificationServiceImpl notificationService,
            TaskRepository taskRepository,
            ProjectMemberRepository projectMemberRepository,
            AuditLogServiceImpl auditLogService
    ) {
        this.automationRuleRepository = automationRuleRepository;
        this.tenantAccessService = tenantAccessService;
        this.notificationService = notificationService;
        this.taskRepository = taskRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.auditLogService = auditLogService;
    }

    public AutomationRule create(AutomationRule payload) {
        if (!tenantAccessService.canManageProjects()) {
            throw ValidationUtils.forbidden("Automation management access required.");
        }

        AutomationRule rule = new AutomationRule();
        rule.setName(ValidationUtils.requireTrimmedText(payload.getName(), "Rule name", 2, 120));
        rule.setTriggerStatus(payload.getTriggerStatus() == null ? TaskStatus.DONE : payload.getTriggerStatus());
        rule.setActionType(payload.getActionType() == null ? AutomationActionType.NOTIFY_PROJECT_MANAGER : payload.getActionType());
        rule.setEnabled(payload.isEnabled());
        rule.setFollowUpDelayDays(payload.getFollowUpDelayDays() == null ? 3 : Math.max(1, Math.min(payload.getFollowUpDelayDays(), 30)));
        rule.setFollowUpTitleTemplate(ValidationUtils.optionalText(payload.getFollowUpTitleTemplate(), "Follow-up title template", 255));
        rule.setCreatedAt(LocalDateTime.now());
        rule.setOrganization(tenantAccessService.getCurrentUser().getOrganization());
        AutomationRule created = automationRuleRepository.save(rule);
        auditLogService.record("AUTOMATION_RULE_CREATED", "AUTOMATION_RULE", created.getId());
        return created;
    }

    public List<AutomationRule> getMine() {
        return automationRuleRepository.findByOrganization_IdOrderByCreatedAtDesc(tenantAccessService.getCurrentOrganizationId());
    }

    public AutomationRule toggle(Long id, boolean enabled) {
        AutomationRule rule = automationRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rule not found"));
        if (!rule.getOrganization().getId().equals(tenantAccessService.getCurrentOrganizationId())) {
            throw ValidationUtils.forbidden("Rule not found in your organization.");
        }
        rule.setEnabled(enabled);
        AutomationRule updated = automationRuleRepository.save(rule);
        auditLogService.record("AUTOMATION_RULE_TOGGLED", "AUTOMATION_RULE", updated.getId());
        return updated;
    }

    public void applyTaskStatusAutomations(Task task, TaskStatus status) {
        List<AutomationRule> rules = automationRuleRepository.findByOrganization_IdAndEnabledTrueAndTriggerStatus(
                task.getProject().getOrganization().getId(),
                status
        );

        if (rules.isEmpty()) {
            return;
        }

        for (AutomationRule rule : rules) {
            if (rule.getActionType() == AutomationActionType.NOTIFY_PROJECT_MANAGER) {
                notifyProjectManagers(task);
            } else if (rule.getActionType() == AutomationActionType.CREATE_FOLLOWUP_TASK) {
                createFollowupTask(task, rule);
            }
        }
    }

    private void notifyProjectManagers(Task task) {
        List<User> managers = projectMemberRepository.findByProjectIdAndProject_Organization_Id(
                        task.getProject().getId(),
                        task.getProject().getOrganization().getId()
                ).stream()
                .filter(pm -> pm.getRoleInProject() == ProjectMemberRole.ADMIN || pm.getUser().getRole() == RoleType.PROJECT_MANAGER)
                .map(ProjectMember::getUser)
                .toList();

        notificationService.notifyUsers(
                managers,
                "Automation: task \"" + task.getTitle() + "\" reached status " + task.getStatus() + ".",
                null,
                NotificationType.AUTOMATION
        );
    }

    private void createFollowupTask(Task sourceTask, AutomationRule rule) {
        String title = rule.getFollowUpTitleTemplate();
        if (title == null || title.isBlank()) {
            title = "Follow-up: " + sourceTask.getTitle();
        }

        Task followup = new Task();
        followup.setTitle(title.trim());
        followup.setDescription("Automatically generated from task #" + sourceTask.getId());
        followup.setPriority(sourceTask.getPriority());
        followup.setStatus(TaskStatus.TODO);
        followup.setEstimatedHours(sourceTask.getEstimatedHours());
        followup.setProject(sourceTask.getProject());
        followup.setAssignedTo(sourceTask.getAssignedTo());
        followup.setDueDate(LocalDate.now().plusDays(rule.getFollowUpDelayDays()));
        followup.setCreatedAt(LocalDateTime.now());

        Task created = taskRepository.save(followup);
        notificationService.createForUser(
                created.getAssignedTo(),
                "Automation created follow-up task \"" + created.getTitle() + "\" for you.",
                NotificationType.AUTOMATION
        );
        auditLogService.record("AUTOMATION_FOLLOWUP_CREATED", "TASK", created.getId());
    }
}
