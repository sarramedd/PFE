package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.Comment;

import java.util.List;

public interface CommentService {
    Comment createComment(Comment comment);

    Comment updateComment(Long id, Comment comment);

    void deleteComment(Long id);

    Comment getCommentById(Long id);

    List<Comment> getCommentsByTask(Long taskId);

    List<Comment> getCommentsByProject(Long projectId);

    List<Comment> getCommentsByAuthor(Long authorId);
}
