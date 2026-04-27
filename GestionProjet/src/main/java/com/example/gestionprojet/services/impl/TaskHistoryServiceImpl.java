package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskChangeType;
import com.example.gestionprojet.entities.TaskHistory;
import com.example.gestionprojet.repositories.TaskHistoryRepository;
import com.example.gestionprojet.security.TenantAccessService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TaskHistoryServiceImpl {
    private final TaskHistoryRepository taskHistoryRepository;
    private final TenantAccessService tenantAccessService;

    public TaskHistoryServiceImpl(TaskHistoryRepository taskHistoryRepository, TenantAccessService tenantAccessService) {
        this.taskHistoryRepository = taskHistoryRepository;
        this.tenantAccessService = tenantAccessService;
    }

    public void record(Task task, TaskChangeType type, String previousValue, String newValue) {
        TaskHistory history = new TaskHistory();
        history.setTask(task);
        history.setChangedBy(tenantAccessService.getCurrentUser());
        history.setChangeType(type);
        history.setPreviousValue(previousValue);
        history.setNewValue(newValue);
        history.setCreatedAt(LocalDateTime.now());
        taskHistoryRepository.save(history);
    }

    public List<TaskHistory> getByTask(Long taskId) {
        return taskHistoryRepository.findByTaskIdAndTask_Project_Organization_IdOrderByCreatedAtDesc(
                taskId,
                tenantAccessService.getCurrentOrganizationId()
        );
    }
}
