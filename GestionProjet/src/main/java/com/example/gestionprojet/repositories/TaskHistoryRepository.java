package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.TaskHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskHistoryRepository extends JpaRepository<TaskHistory, Long> {
    List<TaskHistory> findByTaskIdAndTask_Project_Organization_IdOrderByCreatedAtDesc(Long taskId, Long organizationId);
}
