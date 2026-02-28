package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.RoleType;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.interfaces.ProjectMemberService;
import com.example.gestionprojet.services.interfaces.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class ProjectMemberServiceImpl implements ProjectMemberService {
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public ProjectMember addMember(ProjectMember member) {
        // récupérer user
        if (member.getUser() != null && member.getUser().getId() != null) {
            User user = userRepository.findById(member.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            member.setUser(user);
        }

        // récupérer project
        if (member.getProject() != null && member.getProject().getId() != null) {
            Project project = projectRepository.findById(member.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            member.setProject(project);
        }

        member.setJoinedAt(LocalDateTime.now());
        return projectMemberRepository.save(member);
    }
    @Override
    public ProjectMember updateRole(Long projectId, Long userId, RoleType roleInProject) {

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        member.setRoleInProject(roleInProject);

        return projectMemberRepository.save(member);
    }

    @Override
    public void removeMember(Long projectId, Long userId) {

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        projectMemberRepository.delete(member);
    }

    @Override
    public ProjectMember getById(Long id) {
        return projectMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
    }

    @Override
    public List<ProjectMember> getMembersByProject(Long projectId) {
        return projectMemberRepository.findByProjectId(projectId);
    }

    @Override
    public List<ProjectMember> getProjectsByUser(Long userId) {
        return projectMemberRepository.findByUserId(userId);
    }
}
