package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProjectId(Long projectId);

    List<ProjectMember> findByProjectIdAndProject_Organization_Id(Long projectId, Long organizationId);

    List<ProjectMember> findByUserId(Long userId);

    List<ProjectMember> findByUserIdAndProject_Organization_Id(Long userId, Long organizationId);

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectMember> findByProjectIdAndUserIdAndProject_Organization_Id(Long projectId, Long userId, Long organizationId);

    boolean existsByProjectIdAndUserIdAndProject_Organization_Id(Long projectId, Long userId, Long organizationId);
}
