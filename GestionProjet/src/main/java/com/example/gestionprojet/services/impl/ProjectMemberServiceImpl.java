package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.ProjectMemberRole;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.PermissionAction;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.ProjectMemberService;
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
    @Autowired
    private TenantAccessService tenantAccessService;
    @Autowired
    private NotificationServiceImpl notificationService;

    @Override
    public ProjectMember addMember(ProjectMember member) {
        tenantAccessService.assertCanManageProjects();
        tenantAccessService.assertPermission(PermissionAction.MANAGE_MEMBERS, "You are not allowed to manage project members.");

        if (member.getUser() != null && member.getUser().getId() != null) {
            User user = tenantAccessService.isSuperAdmin()
                    ? userRepository.findById(member.getUser().getId())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    : userRepository.findByIdAndOrganizationId(
                    member.getUser().getId(),
                    tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("User not found in your organization"));
            member.setUser(user);
        }

        if (member.getProject() != null && member.getProject().getId() != null) {
            Project project = tenantAccessService.isSuperAdmin()
                    ? projectRepository.findById(member.getProject().getId())
                    .orElseThrow(() -> new RuntimeException("Project not found"))
                    : projectRepository.findByIdAndOrganizationId(
                    member.getProject().getId(),
                    tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Project not found in your organization"));
            member.setProject(project);
        }

        if (member.getProject() == null || member.getUser() == null) {
            throw new RuntimeException("Project and user are required");
        }

        if (member.getRoleInProject() == null) {
            member.setRoleInProject(ProjectMemberRole.MEMBER);
        }

        boolean alreadyMember = tenantAccessService.isSuperAdmin()
                ? projectMemberRepository.findByProjectIdAndUserId(member.getProject().getId(), member.getUser().getId()).isPresent()
                : projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                member.getProject().getId(),
                member.getUser().getId(),
                tenantAccessService.getCurrentOrganizationId()
        );

        if (alreadyMember) {
            throw new RuntimeException("User is already a member of this project");
        }

        member.setJoinedAt(LocalDateTime.now());
        ProjectMember createdMember = projectMemberRepository.save(member);
        notificationService.createForUser(
                createdMember.getUser(),
                "You have been added to project \"" + createdMember.getProject().getName() + "\"."
        );
        return createdMember;
    }

    @Override
    public ProjectMember updateRole(Long projectId, Long userId, ProjectMemberRole roleInProject) {
        tenantAccessService.assertCanManageProjects();
        tenantAccessService.assertPermission(PermissionAction.MANAGE_MEMBERS, "You are not allowed to manage project members.");

        ProjectMember member = findMembership(projectId, userId);
        member.setRoleInProject(roleInProject);

        ProjectMember updatedMember = projectMemberRepository.save(member);
        notificationService.createForUser(
                updatedMember.getUser(),
                "Your role in project \"" + updatedMember.getProject().getName() + "\" is now " + updatedMember.getRoleInProject() + "."
        );
        return updatedMember;
    }

    @Override
    public void removeMember(Long projectId, Long userId) {
        tenantAccessService.assertCanManageProjects();
        tenantAccessService.assertPermission(PermissionAction.MANAGE_MEMBERS, "You are not allowed to manage project members.");

        ProjectMember member = findMembership(projectId, userId);
        notificationService.createForUser(
                member.getUser(),
                "You have been removed from project \"" + member.getProject().getName() + "\"."
        );
        projectMemberRepository.delete(member);
    }

    @Override
    public ProjectMember getById(Long id) {
        ProjectMember member = projectMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        if (!tenantAccessService.isSuperAdmin()) {
            tenantAccessService.validateSameOrganization(member.getProject());
        }

        return member;
    }

    @Override
    public List<ProjectMember> getMembersByProject(Long projectId) {
        if (tenantAccessService.isSuperAdmin()) {
            return projectMemberRepository.findByProjectId(projectId);
        }

        if (tenantAccessService.isMember()) {
            findMembership(projectId, tenantAccessService.getCurrentUserId());
        }

        return projectMemberRepository.findByProjectIdAndProject_Organization_Id(projectId, tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public List<ProjectMember> getProjectsByUser(Long userId) {
        if (tenantAccessService.isSuperAdmin()) {
            return projectMemberRepository.findByUserId(userId);
        }

        if (tenantAccessService.isMember() && !tenantAccessService.getCurrentUserId().equals(userId)) {
            throw new RuntimeException("You can only access your own project memberships");
        }

        return projectMemberRepository.findByUserIdAndProject_Organization_Id(userId, tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public String inviteMember(Long projectId, String email, ProjectMemberRole roleInProject) {
        tenantAccessService.assertCanManageProjects();
        tenantAccessService.assertPermission(PermissionAction.MANAGE_MEMBERS, "You are not allowed to manage project members.");

        Long organizationId = tenantAccessService.getCurrentOrganizationId();
        Project project = tenantAccessService.isSuperAdmin()
                ? projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"))
                : projectRepository.findByIdAndOrganizationId(projectId, organizationId)
                .orElseThrow(() -> new RuntimeException("Project not found in your organization"));

        return (tenantAccessService.isSuperAdmin()
                ? userRepository.findByEmail(email)
                : userRepository.findByEmailAndOrganizationId(email, organizationId))
                .map(user -> inviteExistingUser(project, user, organizationId, roleInProject))
                .orElse("Invitation simulated for " + email + ". User will join organization project after account creation.");
    }

    private ProjectMember findMembership(Long projectId, Long userId) {
        if (tenantAccessService.isSuperAdmin()) {
            return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() -> new RuntimeException("Membership not found"));
        }

        return projectMemberRepository
                .findByProjectIdAndUserIdAndProject_Organization_Id(projectId, userId, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Membership not found"));
    }

    private String inviteExistingUser(Project project, User user, Long organizationId, ProjectMemberRole roleInProject) {
        boolean alreadyMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                project.getId(),
                user.getId(),
                organizationId
        );

        if (alreadyMember) {
            return "User is already a member of this project.";
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(user);
        member.setRoleInProject(roleInProject == null ? ProjectMemberRole.MEMBER : roleInProject);
        member.setJoinedAt(LocalDateTime.now());
        projectMemberRepository.save(member);

        notificationService.createForUser(
                user,
                "You have been invited to project \"" + project.getName() + "\"."
        );

        return "Invitation simulated and user added to project successfully.";
    }
}
