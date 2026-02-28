package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId")
    List<Project> findProjectsByUserId(Long userId);
    List<Project> findByStatus(ProjectStatus status);

}
