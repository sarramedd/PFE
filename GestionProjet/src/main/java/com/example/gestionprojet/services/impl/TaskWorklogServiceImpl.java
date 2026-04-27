package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.entities.TaskWorklog;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.TaskWorklogRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TaskWorklogServiceImpl {
    private final TaskWorklogRepository taskWorklogRepository;
    private final TaskRepository taskRepository;
    private final TenantAccessService tenantAccessService;
    private final AuditLogServiceImpl auditLogService;
    private final ProjectMemberRepository projectMemberRepository;
    private final Map<Long, ActiveTimer> activeTimers = new ConcurrentHashMap<>();

    public TaskWorklogServiceImpl(
            TaskWorklogRepository taskWorklogRepository,
            TaskRepository taskRepository,
            TenantAccessService tenantAccessService,
            AuditLogServiceImpl auditLogService,
            ProjectMemberRepository projectMemberRepository
    ) {
        this.taskWorklogRepository = taskWorklogRepository;
        this.taskRepository = taskRepository;
        this.tenantAccessService = tenantAccessService;
        this.auditLogService = auditLogService;
        this.projectMemberRepository = projectMemberRepository;
    }

    public TaskWorklog logTime(TaskWorklog payload) {
        if (payload.getTask() == null || payload.getTask().getId() == null) {
            throw ValidationUtils.badRequest("Task is required.");
        }

        Task task = getTaskInScope(payload.getTask().getId());
        ensureCanLogTimeOnTask(task);

        if (payload.getMinutesSpent() == null || payload.getMinutesSpent() <= 0 || payload.getMinutesSpent() > 24 * 60) {
            throw ValidationUtils.badRequest("Minutes spent must be between 1 and 1440.");
        }

        TaskWorklog worklog = new TaskWorklog();
        worklog.setTask(task);
        worklog.setUser(tenantAccessService.getCurrentUser());
        worklog.setMinutesSpent(payload.getMinutesSpent());
        worklog.setWorkDate(payload.getWorkDate() == null ? LocalDate.now() : payload.getWorkDate());
        worklog.setNotes(ValidationUtils.optionalText(payload.getNotes(), "Worklog notes", 1000));
        worklog.setCreatedAt(LocalDateTime.now());

        TaskWorklog created = taskWorklogRepository.save(worklog);
        auditLogService.record("TASK_TIME_LOGGED", "TASK_WORKLOG", created.getId());
        return created;
    }

    public Map<String, Object> startTimer(Long taskId) {
        if (taskId == null) {
            throw ValidationUtils.badRequest("Task id is required.");
        }

        Task task = getTaskInScope(taskId);
        ensureCanLogTimeOnTask(task);

        Long userId = tenantAccessService.getCurrentUserId();
        ActiveTimer existing = activeTimers.get(userId);
        if (existing != null && !existing.taskId().equals(taskId)) {
            throw ValidationUtils.badRequest("A timer is already running on another task. Stop it first.");
        }

        LocalDateTime now = LocalDateTime.now();
        ActiveTimer current = new ActiveTimer(taskId, now);
        activeTimers.put(userId, current);

        Map<String, Object> response = new HashMap<>();
        response.put("taskId", taskId);
        response.put("startedAt", now);
        response.put("running", true);
        response.put("elapsedSeconds", 0);
        return response;
    }

    public TaskWorklog stopTimer(String notes) {
        Long userId = tenantAccessService.getCurrentUserId();
        ActiveTimer activeTimer = activeTimers.get(userId);
        if (activeTimer == null) {
            throw ValidationUtils.badRequest("No active timer found.");
        }

        Task task = getTaskInScope(activeTimer.taskId());
        ensureCanLogTimeOnTask(task);

        Duration duration = Duration.between(activeTimer.startedAt(), LocalDateTime.now());
        long seconds = Math.max(duration.getSeconds(), 0);
        int minutes = (int) Math.max(Math.ceil(seconds / 60.0), 1);

        TaskWorklog worklog = new TaskWorklog();
        worklog.setTask(task);
        worklog.setUser(tenantAccessService.getCurrentUser());
        worklog.setMinutesSpent(minutes);
        worklog.setWorkDate(LocalDate.now());
        worklog.setNotes(ValidationUtils.optionalText(notes, "Worklog notes", 1000));
        worklog.setCreatedAt(LocalDateTime.now());

        TaskWorklog created = taskWorklogRepository.save(worklog);
        activeTimers.remove(userId);
        auditLogService.record("TASK_TIMER_STOPPED", "TASK_WORKLOG", created.getId());
        return created;
    }

    public Map<String, Object> getActiveTimer() {
        Long userId = tenantAccessService.getCurrentUserId();
        ActiveTimer activeTimer = activeTimers.get(userId);
        if (activeTimer == null) {
            return Map.of("running", false);
        }

        Task task = getTaskInScope(activeTimer.taskId());
        long elapsedSeconds = Math.max(Duration.between(activeTimer.startedAt(), LocalDateTime.now()).getSeconds(), 0);

        Map<String, Object> response = new HashMap<>();
        response.put("running", true);
        response.put("taskId", task.getId());
        response.put("taskTitle", task.getTitle());
        response.put("startedAt", activeTimer.startedAt());
        response.put("elapsedSeconds", elapsedSeconds);
        return response;
    }

    public Map<String, Object> getTaskSummary(Long taskId) {
        Task task = getTaskInScope(taskId);
        Long organizationId = tenantAccessService.getCurrentOrganizationId();
        List<TaskWorklog> logs = taskWorklogRepository.findByTaskIdAndTask_Project_Organization_IdOrderByWorkDateDesc(taskId, organizationId);
        int loggedMinutes = logs.stream()
                .mapToInt(log -> log.getMinutesSpent() == null ? 0 : log.getMinutesSpent())
                .sum();
        double loggedHours = Math.round((loggedMinutes / 60.0) * 10.0) / 10.0;
        int estimatedHours = task.getEstimatedHours() == null ? 0 : task.getEstimatedHours();
        double varianceHours = Math.round((loggedHours - estimatedHours) * 10.0) / 10.0;
        double ratio = estimatedHours <= 0 ? 0.0 : Math.round((loggedHours / estimatedHours) * 1000.0) / 10.0;

        Map<String, Object> summary = new HashMap<>();
        summary.put("taskId", task.getId());
        summary.put("taskTitle", task.getTitle());
        summary.put("status", task.getStatus() == null ? TaskStatus.TODO : task.getStatus());
        summary.put("estimatedHours", estimatedHours);
        summary.put("loggedHours", loggedHours);
        summary.put("varianceHours", varianceHours);
        summary.put("consumptionPercent", ratio);
        summary.put("entries", logs.size());
        return summary;
    }

    public List<TaskWorklog> getByTask(Long taskId) {
        Task task = getTaskInScope(taskId);
        ensureCanViewTaskLogs(task);
        return taskWorklogRepository.findByTaskIdAndTask_Project_Organization_IdOrderByWorkDateDesc(
                taskId,
                tenantAccessService.getCurrentOrganizationId()
        );
    }

    private Task getTaskInScope(Long taskId) {
        return taskRepository.findByIdAndProject_Organization_Id(taskId, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Task not found in your organization"));
    }

    private void ensureCanLogTimeOnTask(Task task) {
        User currentUser = tenantAccessService.getCurrentUser();
        if (tenantAccessService.isMember()) {
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUser.getId())) {
                throw ValidationUtils.forbidden("You can log time only on your assigned tasks.");
            }
            return;
        }

        if (tenantAccessService.isProjectManager()) {
            boolean isProjectMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                    task.getProject().getId(),
                    currentUser.getId(),
                    tenantAccessService.getCurrentOrganizationId()
            );
            if (!isProjectMember) {
                throw ValidationUtils.forbidden("You can log time only inside your project assignments.");
            }
        }
    }

    private void ensureCanViewTaskLogs(Task task) {
        if (tenantAccessService.isMember()) {
            Long currentUserId = tenantAccessService.getCurrentUserId();
            if (task.getAssignedTo() == null || !task.getAssignedTo().getId().equals(currentUserId)) {
                throw ValidationUtils.forbidden("You can only view logs of your assigned tasks.");
            }
        }
    }

    private record ActiveTimer(Long taskId, LocalDateTime startedAt) {
    }
}
