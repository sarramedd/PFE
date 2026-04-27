package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.ProjectMemberRole;
import com.example.gestionprojet.entities.ProjectStatus;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.security.PermissionAction;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.ProjectService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class ProjectServiceImpl implements ProjectService {
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private TenantAccessService tenantAccessService;
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    @Autowired
    private NotificationServiceImpl notificationService;
    @Autowired
    private AuditLogServiceImpl auditLogService;

    @Override
    public Project createProject(Project project) {
        tenantAccessService.assertCanManageProjects();
        validateProject(project);
        project.setOrganization(tenantAccessService.getCurrentUser().getOrganization());
        project.setCreatedAt(LocalDateTime.now());

        if (project.getStatus() == null) {
            project.setStatus(ProjectStatus.ACTIVE);
        }

        Project createdProject = projectRepository.save(project);
        auditLogService.record("PROJECT_CREATED", "PROJECT", createdProject.getId());
        addCreatorAsProjectAdmin(createdProject);
        return createdProject;
    }

    @Override
    public Project updateProject(Long id, Project project) {
        tenantAccessService.assertCanManageProjects();

        Project existing = getProjectById(id);
        validateProject(project);

        existing.setName(project.getName());
        existing.setDescription(project.getDescription());
        existing.setStartDate(project.getStartDate());
        existing.setEndDate(project.getEndDate());
        existing.setStatus(project.getStatus());

        Project updatedProject = projectRepository.save(existing);
        auditLogService.record("PROJECT_UPDATED", "PROJECT", updatedProject.getId());
        notifyProjectMembers(updatedProject, "Project \"" + updatedProject.getName() + "\" has been updated.");
        return updatedProject;
    }

    @Override
    public void deleteProject(Long id) {
        tenantAccessService.assertCanManageProjects();
        tenantAccessService.assertPermission(PermissionAction.DELETE_PROJECT, "You are not allowed to delete projects.");
        Project project = getProjectById(id);
        auditLogService.record("PROJECT_DELETED", "PROJECT", project.getId());
        notifyProjectMembers(project, "Project \"" + project.getName() + "\" has been deleted.");
        projectRepository.delete(project);
    }

    @Override
    public Project getProjectById(Long id) {
        if (tenantAccessService.isSuperAdmin()) {
            return projectRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
        }
        Project project = projectRepository.findByIdAndOrganizationId(id, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Project not found in your organization"));

        if (tenantAccessService.isMember()) {
            boolean isMemberOfProject = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                    id,
                    tenantAccessService.getCurrentUserId(),
                    tenantAccessService.getCurrentOrganizationId()
            );

            if (!isMemberOfProject) {
                throw ValidationUtils.forbidden("You can only access your own projects.");
            }
        }

        return project;
    }

    @Override
    public List<Project> getAllProjects() {
        if (tenantAccessService.isSuperAdmin()) {
            return projectRepository.findAll();
        }
        if (tenantAccessService.isMember()) {
            return projectRepository.findProjectsByUserIdAndOrganizationId(
                    tenantAccessService.getCurrentUserId(),
                    tenantAccessService.getCurrentOrganizationId()
            );
        }
        return projectRepository.findByOrganizationId(tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public List<Project> getProjectsByStatus(ProjectStatus status) {
        if (tenantAccessService.isSuperAdmin()) {
            return projectRepository.findAll().stream()
                    .filter(project -> project.getStatus() == status)
                    .toList();
        }
        return projectRepository.findByOrganizationIdAndStatus(tenantAccessService.getCurrentOrganizationId(), status);
    }

    @Override
    public Project changeStatus(Long id, ProjectStatus status) {
        tenantAccessService.assertCanManageProjects();
        Project project = getProjectById(id);
        project.setStatus(status);
        Project updatedProject = projectRepository.save(project);
        auditLogService.record("PROJECT_STATUS_CHANGED", "PROJECT", updatedProject.getId());
        notifyProjectMembers(updatedProject, "Project \"" + updatedProject.getName() + "\" status changed to " + updatedProject.getStatus() + ".");
        return updatedProject;
    }

    private void validateProject(Project project) {
        project.setName(ValidationUtils.requireTrimmedText(project.getName(), "Project name", 3, 100));
        project.setDescription(ValidationUtils.optionalText(project.getDescription(), "Project description", 1000));
        ValidationUtils.validateDateRange(project.getStartDate(), project.getEndDate(), "start date", "end date");
    }

    private void addCreatorAsProjectAdmin(Project project) {
        User creator = tenantAccessService.getCurrentUser();
        boolean alreadyMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                project.getId(),
                creator.getId(),
                project.getOrganization().getId()
        );

        if (alreadyMember) {
            return;
        }

        ProjectMember member = new ProjectMember();
        member.setProject(project);
        member.setUser(creator);
        member.setRoleInProject(ProjectMemberRole.ADMIN);
        member.setJoinedAt(LocalDateTime.now());
        projectMemberRepository.save(member);
    }

    private void notifyProjectMembers(Project project, String message) {
        List<User> users = projectMemberRepository.findByProjectIdAndProject_Organization_Id(
                        project.getId(),
                        project.getOrganization().getId())
                .stream()
                .map(ProjectMember::getUser)
                .toList();

        notificationService.notifyUsers(users, message, tenantAccessService.getCurrentUserId());
    }
}
