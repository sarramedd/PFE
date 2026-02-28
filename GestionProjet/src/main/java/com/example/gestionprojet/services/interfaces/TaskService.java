package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;

import java.util.List;

public interface TaskService {
    Task createTask(Task task);

    Task updateTask(Long id, Task task);

    void deleteTask(Long id);

    Task getTaskById(Long id);

    List<Task> getAllTasks();

    List<Task> getTasksByProject(Long projectId);

    List<Task> getTasksByUser(Long userId);

    List<Task> getTasksByStatus(TaskStatus status);

    List<Task> getTasksByProjectAndStatus(Long projectId, TaskStatus status);

    Task changeStatus(Long id, TaskStatus status);
}
