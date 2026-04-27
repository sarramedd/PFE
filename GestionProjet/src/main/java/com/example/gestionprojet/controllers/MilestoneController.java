package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Milestone;
import com.example.gestionprojet.services.impl.MilestoneServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/milestones")
public class MilestoneController {
    private final MilestoneServiceImpl milestoneService;

    public MilestoneController(MilestoneServiceImpl milestoneService) {
        this.milestoneService = milestoneService;
    }

    @PostMapping
    public ResponseEntity<Milestone> create(@RequestBody Milestone milestone) {
        return new ResponseEntity<>(milestoneService.create(milestone), HttpStatus.CREATED);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Milestone>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(milestoneService.getByProject(projectId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Milestone> update(@PathVariable Long id, @RequestBody Milestone payload) {
        return ResponseEntity.ok(milestoneService.update(id, payload));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        milestoneService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
