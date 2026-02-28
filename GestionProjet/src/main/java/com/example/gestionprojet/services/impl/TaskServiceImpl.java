package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.interfaces.TaskService;
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

    @Override
    public Task createTask(Task task) {

        if (task.getProject() != null) {
            Project project = projectRepository.findById(task.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            task.setProject(project);
        }

        if (task.getAssignedTo() != null) {
            User user = userRepository.findById(task.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            task.setAssignedTo(user);
        }

        task.setCreatedAt(LocalDateTime.now());

        if (task.getStatus() == null) {
            task.setStatus(TaskStatus.TODO);
        }

        return taskRepository.save(task);
    }

    @Override
    public Task updateTask(Long id, Task task) {
        Task existing = getTaskById(id);

        existing.setTitle(task.getTitle());
        existing.setDescription(task.getDescription());
        existing.setPriority(task.getPriority());
        existing.setStatus(task.getStatus());
        existing.setDueDate(task.getDueDate());

        if (task.getAssignedTo() != null) {
            User user = userRepository.findById(task.getAssignedTo().getId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            existing.setAssignedTo(user);
        }

        if (task.getProject() != null) {
            Project project = projectRepository.findById(task.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            existing.setProject(project);
        }

        existing.setParentTask(task.getParentTask());

        return taskRepository.save(existing);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = getTaskById(id);
        taskRepository.delete(task);
    }

    @Override
    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @Override
    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    @Override
    public List<Task> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId);
    }

    @Override
    public List<Task> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId);
    }

    @Override
    public List<Task> getTasksByStatus(TaskStatus status) {
        return taskRepository.findByStatus(status);
    }

    @Override
    public List<Task> getTasksByProjectAndStatus(Long projectId, TaskStatus status) {
        return taskRepository.findByProjectIdAndStatus(projectId, status);
    }

    @Override
    public Task changeStatus(Long id, TaskStatus status) {
        Task task = getTaskById(id);
        task.setStatus(status);
        return taskRepository.save(task);
    }
}
