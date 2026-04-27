package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectIdAndProject_Organization_IdOrderByDueDateAsc(Long projectId, Long organizationId);

    Optional<Milestone> findByIdAndProject_Organization_Id(Long id, Long organizationId);
}
