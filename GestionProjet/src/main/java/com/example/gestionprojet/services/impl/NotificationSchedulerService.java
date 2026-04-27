package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.*;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.TenantAccessService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationSchedulerService {
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final NotificationPreferenceServiceImpl notificationPreferenceService;
    private final NotificationServiceImpl notificationService;

    public NotificationSchedulerService(
            TaskRepository taskRepository,
            UserRepository userRepository,
            ProjectMemberRepository projectMemberRepository,
            NotificationPreferenceServiceImpl notificationPreferenceService,
            NotificationServiceImpl notificationService
    ) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.notificationPreferenceService = notificationPreferenceService;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 30 7 * * *")
    public void sendDueReminders() {
        List<User> users = userRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        for (User user : users) {
            NotificationPreference preference = notificationPreferenceService.getOrCreateForUser(user);
            if (!preference.isDueReminderEnabled()) {
                continue;
            }

            List<Task> tasks = taskRepository.findByAssignedToIdAndAssignedTo_Organization_Id(user.getId(), user.getOrganization().getId()).stream()
                    .filter(task -> task.getStatus() != TaskStatus.DONE)
                    .filter(task -> task.getDueDate() != null && (task.getDueDate().isEqual(today) || task.getDueDate().isEqual(tomorrow)))
                    .toList();

            if (!tasks.isEmpty()) {
                notificationService.createForUser(
                        user,
                        "Reminder: you have " + tasks.size() + " task(s) due today or tomorrow.",
                        NotificationType.DUE_REMINDER
                );
            }
        }
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyDigest() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            NotificationPreference preference = notificationPreferenceService.getOrCreateForUser(user);
            if (!preference.isDailyDigestEnabled()) {
                continue;
            }

            List<Task> tasks = taskRepository.findByAssignedToIdAndAssignedTo_Organization_Id(user.getId(), user.getOrganization().getId());
            long todo = tasks.stream().filter(task -> task.getStatus() == TaskStatus.TODO).count();
            long inProgress = tasks.stream().filter(task -> task.getStatus() == TaskStatus.IN_PROGRESS).count();
            long done = tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
            long overdue = tasks.stream()
                    .filter(task -> task.getStatus() != TaskStatus.DONE && task.getDueDate() != null && task.getDueDate().isBefore(LocalDate.now()))
                    .count();

            notificationService.createForUser(
                    user,
                    "Daily summary: TODO=" + todo + ", IN_PROGRESS=" + inProgress + ", DONE=" + done + ", OVERDUE=" + overdue + ".",
                    NotificationType.DAILY_DIGEST
            );
        }
    }

    @Scheduled(cron = "0 15 8 * * MON")
    public void sendOverloadAlerts() {
        List<User> users = userRepository.findAll();
        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();

        for (User user : users) {
            NotificationPreference preference = notificationPreferenceService.getOrCreateForUser(user);
            if (!preference.isOverloadAlertEnabled()) {
                continue;
            }

            int estimatedHours = taskRepository.findByAssignedToIdAndAssignedTo_Organization_Id(user.getId(), user.getOrganization().getId()).stream()
                    .filter(task -> task.getStatus() != TaskStatus.DONE)
                    .map(Task::getEstimatedHours)
                    .filter(hours -> hours != null)
                    .mapToInt(Integer::intValue)
                    .sum();

            if (estimatedHours < 40) {
                continue;
            }

            List<User> managers = projectMemberRepository.findByUserIdAndProject_Organization_Id(user.getId(), user.getOrganization().getId()).stream()
                    .map(ProjectMember::getProject)
                    .distinct()
                    .flatMap(project -> projectMemberRepository.findByProjectIdAndProject_Organization_Id(project.getId(), project.getOrganization().getId()).stream())
                    .filter(member -> member.getRoleInProject() == ProjectMemberRole.ADMIN || member.getUser().getRole() == RoleType.PROJECT_MANAGER)
                    .map(ProjectMember::getUser)
                    .collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a))
                    .values()
                    .stream()
                    .toList();

            notificationService.notifyUsers(
                    managers,
                    "Overload alert: " + user.getFirstName() + " " + user.getLastName() + " has " + estimatedHours + " estimated open hours.",
                    null,
                    NotificationType.OVERLOAD_ALERT
            );
        }
    }
}
