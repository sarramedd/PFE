package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.RoleType;
import com.example.gestionprojet.services.impl.ProjectMemberServiceImpl;
import com.example.gestionprojet.services.interfaces.ProjectMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-members")

public class ProjectMemberController {
    @Autowired
    private  ProjectMemberServiceImpl projectMemberService;
    @PostMapping
    public ResponseEntity<ProjectMember> addMember(@RequestBody ProjectMember member) {
        ProjectMember created = projectMemberService.addMember(member);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping
    public ResponseEntity<ProjectMember> updateRole(
            @RequestParam Long projectId,
            @RequestParam Long userId,
            @RequestParam RoleType roleInProject) {

        ProjectMember updated = projectMemberService
                .updateRole(projectId, userId, roleInProject);

        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping
    public ResponseEntity<Void> removeMember(
            @RequestParam Long projectId,
            @RequestParam Long userId) {

        projectMemberService.removeMember(projectId, userId);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<ProjectMember>> getMembersByProject(
            @PathVariable Long projectId) {

        List<ProjectMember> members =
                projectMemberService.getMembersByProject(projectId);

        return new ResponseEntity<>(members, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ProjectMember>> getProjectsByUser(
            @PathVariable Long userId) {

        List<ProjectMember> projects =
                projectMemberService.getProjectsByUser(userId);

        return new ResponseEntity<>(projects, HttpStatus.OK);
    }
}
