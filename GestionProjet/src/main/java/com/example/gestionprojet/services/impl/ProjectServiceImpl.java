package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectStatus;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.services.interfaces.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class ProjectServiceImpl implements ProjectService {
    @Autowired
    private ProjectRepository projectRepository;

    @Override
    public Project createProject(Project project) {

        project.setCreatedAt(LocalDateTime.now());

        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.ACTIVE);
        }

        return projectRepository.save(project);
    }

    @Override
    public Project updateProject(Long id, Project project) {

        Project existing = getProjectById(id);

        existing.setName(project.getName());
        existing.setDescription(project.getDescription());
        existing.setStartDate(project.getStartDate());
        existing.setEndDate(project.getEndDate());
        existing.setStatus(project.getStatus());

        return projectRepository.save(existing);
    }

    @Override
    public void deleteProject(Long id) {
        Project project = getProjectById(id);
        projectRepository.delete(project);
    }

    @Override
    public Project getProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public List<Project> getProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    @Override
    public Project changeStatus(Long id, ProjectStatus status) {
        Project project = getProjectById(id);
        project.setStatus(status);
        return projectRepository.save(project);
    }
}
