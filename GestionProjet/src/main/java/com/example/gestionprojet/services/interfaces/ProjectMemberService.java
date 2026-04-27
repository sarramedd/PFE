package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.ProjectMemberRole;

import java.util.List;

public interface ProjectMemberService {
    ProjectMember addMember(ProjectMember member);

    ProjectMember updateRole(Long projectId, Long userId, ProjectMemberRole roleInProject);

    void removeMember(Long projectId, Long userId);

    ProjectMember getById(Long id);

    List<ProjectMember> getMembersByProject(Long projectId);

    List<ProjectMember> getProjectsByUser(Long userId);

    String inviteMember(Long projectId, String email, ProjectMemberRole roleInProject);
}
