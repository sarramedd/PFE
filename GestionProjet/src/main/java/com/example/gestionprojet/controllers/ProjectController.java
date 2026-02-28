package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectStatus;
import com.example.gestionprojet.services.impl.ProjectServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")

public class ProjectController {
@Autowired
    private ProjectServiceImpl projectService;

    @PostMapping
    public ResponseEntity<Project> create(@RequestBody Project project) {
        Project created = projectService.createProject(project);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Project> getById(@PathVariable Long id) {
        Project project = projectService.getProjectById(id);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Project>> getAll() {
        List<Project> projects = projectService.getAllProjects();
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Project>> getByStatus(@PathVariable ProjectStatus status) {
        List<Project> projects = projectService.getProjectsByStatus(status);
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Project> update(@PathVariable Long id,
                                          @RequestBody Project project) {
        Project updated = projectService.updateProject(id, project);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Project> changeStatus(@PathVariable Long id,
                                                @RequestParam ProjectStatus status) {
        Project updated = projectService.changeStatus(id, status);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.deleteProject(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
