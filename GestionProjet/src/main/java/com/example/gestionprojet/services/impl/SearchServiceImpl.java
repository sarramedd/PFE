package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SearchServiceImpl {
    private final ProjectServiceImpl projectService;
    private final TaskServiceImpl taskService;
    private final UserRepository userRepository;
    private final TenantAccessService tenantAccessService;

    public SearchServiceImpl(
            ProjectServiceImpl projectService,
            TaskServiceImpl taskService,
            UserRepository userRepository,
            TenantAccessService tenantAccessService
    ) {
        this.projectService = projectService;
        this.taskService = taskService;
        this.userRepository = userRepository;
        this.tenantAccessService = tenantAccessService;
    }

    public Map<String, Object> globalSearch(String query) {
        String term = ValidationUtils.requireTrimmedText(query, "Search query", 2, 100);

        List<Project> projects = projectService.getAllProjects().stream()
                .filter(project -> contains(project.getName(), term) || contains(project.getDescription(), term))
                .limit(8)
                .toList();

        List<Task> tasks = accessibleTasks().stream()
                .filter(task -> contains(task.getTitle(), term)
                        || contains(task.getDescription(), term)
                        || contains(task.getProject() != null ? task.getProject().getName() : null, term))
                .limit(10)
                .toList();

        List<User> users = tenantAccessService.isMember()
                ? List.of()
                : userRepository.searchInOrganization(tenantAccessService.getCurrentOrganizationId(), term).stream()
                .limit(8)
                .toList();

        return Map.of(
                "projects", projects,
                "tasks", tasks,
                "users", users
        );
    }

    private List<Task> accessibleTasks() {
        if (tenantAccessService.isMember()) {
            return taskService.getTasksByUser(tenantAccessService.getCurrentUserId());
        }
        return taskService.getAllTasks();
    }

    private boolean contains(String value, String term) {
        return value != null && value.toLowerCase().contains(term.toLowerCase());
    }
}
