package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectStatus;

import java.util.List;

public interface ProjectService {
    Project createProject(Project project);

    Project updateProject(Long id, Project project);

    void deleteProject(Long id);

    Project getProjectById(Long id);

    List<Project> getAllProjects();

    List<Project> getProjectsByStatus(ProjectStatus status);

    Project changeStatus(Long id, ProjectStatus status);
}
