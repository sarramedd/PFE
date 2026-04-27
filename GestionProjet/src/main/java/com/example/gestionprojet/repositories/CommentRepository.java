package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskId(Long taskId);

    List<Comment> findByTaskIdAndTask_Project_Organization_IdOrderByCreatedAtAsc(Long taskId, Long organizationId);

    List<Comment> findByAuthorId(Long authorId);

    List<Comment> findByProjectIdOrderByCreatedAtAsc(Long projectId);

    List<Comment> findByProjectIdAndProject_Organization_IdOrderByCreatedAtAsc(Long projectId, Long organizationId);
}
