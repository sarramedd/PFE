package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.CommentRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.impl.CommentServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    @Autowired
    private CommentServiceImpl commentService;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CommentRepository commentRepository;
    @PostMapping
    public ResponseEntity<Comment> createComment(@RequestBody Comment comment) {
        Comment created = commentService.createComment(comment);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> getCommentById(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        return new ResponseEntity<>(comment, HttpStatus.OK);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Comment>> getCommentsByTask(@PathVariable Long taskId) {
        List<Comment> comments = commentService.getCommentsByTask(taskId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<List<Comment>> getCommentsByAuthor(@PathVariable Long authorId) {
        List<Comment> comments = commentService.getCommentsByAuthor(authorId);
        return new ResponseEntity<>(comments, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Comment> updateComment(@PathVariable Long id, @RequestBody Comment comment) {
        Comment updated = commentService.updateComment(id, comment);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
