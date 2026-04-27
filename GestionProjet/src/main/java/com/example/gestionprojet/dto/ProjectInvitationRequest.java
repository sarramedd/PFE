package com.example.gestionprojet.dto;

import com.example.gestionprojet.entities.ProjectMemberRole;

public class ProjectInvitationRequest {
    private Long projectId;
    private String email;
    private ProjectMemberRole role = ProjectMemberRole.MEMBER;

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public ProjectMemberRole getRole() {
        return role;
    }

    public void setRole(ProjectMemberRole role) {
        this.role = role;
    }
}
