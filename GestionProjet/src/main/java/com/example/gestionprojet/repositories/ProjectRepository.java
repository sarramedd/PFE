package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId AND pm.project.organization.id = :organizationId")
    List<Project> findProjectsByUserIdAndOrganizationId(Long userId, Long organizationId);
    List<Project> findByOrganizationId(Long organizationId);
    List<Project> findByOrganizationIdAndStatus(Long organizationId, ProjectStatus status);
    Optional<Project> findByIdAndOrganizationId(Long id, Long organizationId);

}
