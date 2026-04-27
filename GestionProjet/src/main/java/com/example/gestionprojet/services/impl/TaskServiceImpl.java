package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskChangeType;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.entities.NotificationType;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.entities.ProjectMemberRole;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.PermissionAction;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.TaskService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskServiceImpl implements TaskService {
    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository ;
    @Autowired
    private ProjectRepository projectRepository ;
    @Autowired
    private TenantAccessService tenantAccessService;
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    @Autowired
    private NotificationServiceImpl notificationService;
    @Autowired
    private AuditLogServiceImpl auditLogService;
    @Autowired
    private TaskHistoryServiceImpl taskHistoryService;
    @Autowired
    private AutomationRuleServiceImpl automationRuleService;

    @Override
    public Task createTask(Task task) {
        validateTask(task);

        Project project = resolveProject(task);
        task.setProject(project);

        if (tenantAccessService.isMember()) {
            ensureMembership(project.getId());
            if (!isCurrentUserProjectAdmin(project.getId())) {
                task.setAssignedTo(tenantAccessService.getCurrentUser());
            } else if (task.getAssignedTo() != null) {
                User user = userRepository.findByIdAndOrganizationId(
                                task.getAssignedTo().getId(),
                                tenantAccessService.getCurrentOrganizationId())
                        .orElseThrow(() -> new RuntimeException("Assigned user not found in your organization"));
                task.setAssignedTo(user);
            }
        } else if (task.getAssignedTo() != null) {
            User user = userRepository.findByIdAndOrganizationId(
                            task.getAssignedTo().getId(),
                            tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found in your organization"));
            task.setAssignedTo(user);
        }

        task.setCreatedAt(LocalDateTime.now());

        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }

        task.setParentTask(resolveTaskReference(task.getParentTask(), project, "Parent task", null));
        task.setDependsOn(resolveTaskReference(task.getDependsOn(), project, "Dependency task", null));

        Task createdTask = taskRepository.save(task);
        auditLogService.record("TASK_CREATED", "TASK", createdTask.getId());
        taskHistoryService.record(createdTask, TaskChangeType.CREATED, null, "Task created with status " + createdTask.getStatus());
        notifyTaskAudience(createdTask, "A new task \"" + createdTask.getTitle() + "\" was added to project \"" + createdTask.getProject().getName() + "\".");
        return createdTask;
    }

    @Override
    public Task updateTask(Long id, Task task) {
        Task existing = getTaskById(id);
        if (tenantAccessService.isMember()) {
            ensureMembership(existing.getProject().getId());
            if (!isCurrentUserProjectAdmin(existing.getProject().getId())) {
                throw ValidationUtils.forbidden("Only project admins can edit task details.");
            }
        } else {
            tenantAccessService.assertCanManageProjects();
        }

        validateTask(task);
        String previousStatus = existing.getStatus() == null ? null : existing.getStatus().name();

        existing.setTitle(task.getTitle());
        existing.setDescription(task.getDescription());
        existing.setPriority(task.getPriority());
        existing.setStatus(task.getStatus());
        existing.setDueDate(task.getDueDate());
        existing.setEstimatedHours(task.getEstimatedHours());

        if (task.getAssignedTo() != null) {
            User user = userRepository.findByIdAndOrganizationId(
                            task.getAssignedTo().getId(),
                            tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found in your organization"));
            existing.setAssignedTo(user);
        }

        if (task.getProject() != null) {
            Project project = projectRepository.findByIdAndOrganizationId(
                            task.getProject().getId(),
                            tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Project not found in your organization"));
            existing.setProject(project);
        }

        existing.setParentTask(resolveTaskReference(task.getParentTask(), existing.getProject(), "Parent task", existing.getId()));
        existing.setDependsOn(resolveTaskReference(task.getDependsOn(), existing.getProject(), "Dependency task", existing.getId()));

        Task updatedTask = taskRepository.save(existing);
        auditLogService.record("TASK_UPDATED", "TASK", updatedTask.getId());
        taskHistoryService.record(updatedTask, TaskChangeType.UPDATED, previousStatus, updatedTask.getStatus() == null ? null : updatedTask.getStatus().name());
        notifyTaskAudience(updatedTask, "Task \"" + updatedTask.getTitle() + "\" was updated.");
        return updatedTask;
    }

    @Override
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        if (tenantAccessService.isMember()) {
            ensureMembership(task.getProject().getId());
            if (!isCurrentUserProjectAdmin(task.getProject().getId())) {
                throw ValidationUtils.forbidden("Only project admins can delete tasks.");
            }
        } else {
            tenantAccessService.assertCanManageProjects();
            tenantAccessService.assertPermission(PermissionAction.DELETE_TASK, "You are not allowed to delete tasks.");
        }
        taskHistoryService.record(task, TaskChangeType.DELETED, task.getStatus() == null ? null : task.getStatus().name(), "Task deleted");
        auditLogService.record("TASK_DELETED", "TASK", task.getId());
        notifyTaskAudience(task, "Task \"" + task.getTitle() + "\" was deleted.");
        taskRepository.delete(task);
    }

    @Override
    public Task getTaskById(Long id) {
        if (tenantAccessService.isSuperAdmin()) {
            return taskRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Task not found"));
        }
        return taskRepository.findByIdAndProject_Organization_Id(id, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Task not found in your organization"));
    }

    @Override
    public List<Task> getAllTasks() {
        if (tenantAccessService.isSuperAdmin()) {
            return taskRepository.findAll();
        }
        return taskRepository.findByProject_Organization_Id(tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public List<Task> getTasksByProject(Long projectId) {
        if (tenantAccessService.isSuperAdmin()) {
            return taskRepository.findByProjectId(projectId);
        }
        if (tenantAccessService.isMember()) {
            boolean isMemberOfProject = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                    projectId,
                    tenantAccessService.getCurrentUserId(),
                    tenantAccessService.getCurrentOrganizationId()
            );
            if (!isMemberOfProject) {
                throw ValidationUtils.forbidden("You can only access tasks from your own projects.");
            }
        }
        return taskRepository.findByProjectIdAndProject_Organization_Id(projectId, tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public List<Task> getTasksByUser(Long userId) {
        if (tenantAccessService.isSuperAdmin()) {
            return taskRepository.findByAssignedToId(userId);
        }
        if (tenantAccessService.isMember() && !tenantAccessService.getCurrentUserId().equals(userId)) {
            throw ValidationUtils.forbidden("You can only access your own tasks.");
        }
        return taskRepository.findByAssignedToIdAndAssignedTo_Organization_Id(userId, tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public List<Task> getTasksByStatus(TaskStatus status) {
        if (tenantAccessService.isSuperAdmin()) {
            return taskRepository.findAll().stream()
                    .filter(task -> task.getStatus() == status)
                    .toList();
        }
        return taskRepository.findByProject_Organization_IdAndStatus(tenantAccessService.getCurrentOrganizationId(), status);
    }

    @Override
    public List<Task> getTasksByProjectAndStatus(Long projectId, TaskStatus status) {
        if (tenantAccessService.isSuperAdmin()) {
            return taskRepository.findByProjectId(projectId).stream()
                    .filter(task -> task.getStatus() == status)
                    .toList();
        }
        return taskRepository.findByProjectIdAndProject_Organization_IdAndStatus(projectId, tenantAccessService.getCurrentOrganizationId(), status);
    }

    @Override
    public Task changeStatus(Long id, TaskStatus status) {
        Task task = getTaskById(id);

        if (tenantAccessService.isMember()) {
            ensureMembership(task.getProject().getId());
            boolean isProjectAdmin = isCurrentUserProjectAdmin(task.getProject().getId());
            if (!isProjectAdmin && (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(tenantAccessService.getCurrentUserId()))) {
                throw ValidationUtils.forbidden("You can only change the status of your own tasks.");
            }
        } else {
            tenantAccessService.assertCanManageProjects();
        }

        String previousStatus = task.getStatus() == null ? null : task.getStatus().name();
        task.setStatus(status);
        Task updatedTask = taskRepository.save(task);
        auditLogService.record("TASK_STATUS_CHANGED", "TASK", updatedTask.getId());
        taskHistoryService.record(updatedTask, TaskChangeType.STATUS_CHANGED, previousStatus, status.name());
        automationRuleService.applyTaskStatusAutomations(updatedTask, status);
        notifyTaskAudience(updatedTask, "Task \"" + updatedTask.getTitle() + "\" status changed to " + updatedTask.getStatus() + ".");
        return updatedTask;
    }

    private void validateTask(Task task) {
        task.setTitle(ValidationUtils.requireTrimmedText(task.getTitle(), "Task title", 3, 120));
        task.setDescription(ValidationUtils.optionalText(task.getDescription(), "Task description", 2000));
        ValidationUtils.validateFutureOrToday(task.getDueDate(), "Due date");
        if (task.getEstimatedHours() != null && task.getEstimatedHours() <= 0) {
            throw ValidationUtils.badRequest("Estimated hours must be greater than 0.");
        }
        if (task.getEstimatedHours() != null && task.getEstimatedHours() > 500) {
            throw ValidationUtils.badRequest("Estimated hours must not exceed 500.");
        }
    }

    private Project resolveProject(Task task) {
        if (task.getProject() == null || task.getProject().getId() == null) {
            throw ValidationUtils.badRequest("Project is required.");
        }

        return projectRepository.findByIdAndOrganizationId(
                        task.getProject().getId(),
                        tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Project not found in your organization"));
    }

    private void ensureMembership(Long projectId) {
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                projectId,
                tenantAccessService.getCurrentUserId(),
                tenantAccessService.getCurrentOrganizationId()
        );

        if (!isMember) {
            throw ValidationUtils.forbidden("You can only create or update tasks inside your own projects.");
        }
    }

    private boolean isCurrentUserProjectAdmin(Long projectId) {
        return projectMemberRepository
                .findByProjectIdAndUserIdAndProject_Organization_Id(
                        projectId,
                        tenantAccessService.getCurrentUserId(),
                        tenantAccessService.getCurrentOrganizationId()
                )
                .map(ProjectMember::getRoleInProject)
                .map(role -> role == ProjectMemberRole.ADMIN)
                .orElse(false);
    }

    private Task resolveTaskReference(Task reference, Project project, String label, Long currentTaskId) {
        if (reference == null || reference.getId() == null) {
            return null;
        }

        if (currentTaskId != null && currentTaskId.equals(reference.getId())) {
            throw ValidationUtils.badRequest(label + " cannot reference the same task.");
        }

        Task resolved = taskRepository.findByIdAndProject_Organization_Id(
                        reference.getId(),
                        tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException(label + " not found in your organization"));

        if (resolved.getProject() == null || project == null || !resolved.getProject().getId().equals(project.getId())) {
            throw ValidationUtils.badRequest(label + " must belong to the same project.");
        }

        return resolved;
    }

    private void notifyTaskAudience(Task task, String message) {
        if (task.getProject() == null || task.getProject().getId() == null) {
            return;
        }

        List<User> users = projectMemberRepository.findByProjectIdAndProject_Organization_Id(
                        task.getProject().getId(),
                        task.getProject().getOrganization().getId())
                .stream()
                .map(ProjectMember::getUser)
                .toList();

        notificationService.notifyUsers(users, message, tenantAccessService.getCurrentUserId(), NotificationType.TASK_UPDATE);

        if (task.getAssignedTo() != null) {
            notificationService.createForUser(
                    task.getAssignedTo(),
                    "You have been assigned to task \"" + task.getTitle() + "\".",
                    NotificationType.TASK_UPDATE
            );
        }
    }
}
