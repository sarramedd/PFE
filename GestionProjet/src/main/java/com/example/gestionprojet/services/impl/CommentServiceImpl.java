package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.CommentRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.interfaces.CommentService;
import com.example.gestionprojet.services.interfaces.TaskService;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;
    @Override
    public Comment createComment(Comment comment) {

        if (comment.getTask() != null) {
            Task task = taskRepository.findById(comment.getTask().getId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            comment.setTask(task);
        }

        if (comment.getAuthor() != null) {
            User author = userRepository.findById(comment.getAuthor().getId())
                    .orElseThrow(() -> new RuntimeException("Author not found"));
            comment.setAuthor(author);
        }

        comment.setCreatedAt(LocalDateTime.now());

        return commentRepository.save(comment);
    }

    @Override
    public Comment updateComment(Long id, Comment comment) {
        Comment existing = getCommentById(id);

        existing.setContent(comment.getContent());

        return commentRepository.save(existing);
    }

    @Override
    public void deleteComment(Long id) {
        Comment comment = getCommentById(id);
        commentRepository.delete(comment);
    }

    @Override
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
    }

    @Override
    public List<Comment> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskId(taskId);
    }

    @Override
    public List<Comment> getCommentsByAuthor(Long authorId) {
        return commentRepository.findByAuthorId(authorId);
    }
}
