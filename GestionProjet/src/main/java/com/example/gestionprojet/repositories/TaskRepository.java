package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    List<Task> findByProjectIdAndProject_Organization_Id(Long projectId, Long organizationId);

    List<Task> findByAssignedToId(Long userId);

    List<Task> findByAssignedToIdAndAssignedTo_Organization_Id(Long userId, Long organizationId);

    List<Task> findByProject_Organization_Id(Long organizationId);

    List<Task> findByProject_Organization_IdAndStatus(Long organizationId, TaskStatus status);

    List<Task> findByProjectIdAndProject_Organization_IdAndStatus(Long projectId, Long organizationId, TaskStatus status);

    List<Task> findByParentTaskIdAndProject_Organization_Id(Long parentTaskId, Long organizationId);

    List<Task> findByAssignedTo_Organization_IdAndDueDateBetweenAndStatusNot(Long organizationId, LocalDate startDate, LocalDate endDate, TaskStatus status);

    List<Task> findByAssignedTo_Organization_IdAndDueDateBeforeAndStatusNot(Long organizationId, LocalDate beforeDate, TaskStatus status);

    Optional<Task> findByIdAndProject_Organization_Id(Long id, Long organizationId);
}
