package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.TaskWorklog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TaskWorklogRepository extends JpaRepository<TaskWorklog, Long> {
    List<TaskWorklog> findByTaskIdAndTask_Project_Organization_IdOrderByWorkDateDesc(Long taskId, Long organizationId);

    List<TaskWorklog> findByUserIdAndTask_Project_Organization_IdAndWorkDateBetweenOrderByWorkDateAsc(
            Long userId,
            Long organizationId,
            LocalDate startDate,
            LocalDate endDate
    );
}
