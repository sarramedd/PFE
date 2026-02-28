package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
}
