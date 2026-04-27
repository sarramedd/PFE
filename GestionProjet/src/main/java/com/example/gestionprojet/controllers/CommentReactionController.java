package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.CommentReaction;
import com.example.gestionprojet.entities.ReactionType;
import com.example.gestionprojet.services.impl.CommentReactionServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment-reactions")
public class CommentReactionController {
    private final CommentReactionServiceImpl commentReactionService;

    public CommentReactionController(CommentReactionServiceImpl commentReactionService) {
        this.commentReactionService = commentReactionService;
    }

    @PostMapping("/{commentId}")
    public ResponseEntity<CommentReaction> addReaction(
            @PathVariable Long commentId,
            @RequestParam ReactionType type
    ) {
        return new ResponseEntity<>(commentReactionService.addReaction(commentId, type), HttpStatus.CREATED);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> removeReaction(
            @PathVariable Long commentId,
            @RequestParam ReactionType type
    ) {
        commentReactionService.removeReaction(commentId, type);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<List<CommentReaction>> getByComment(@PathVariable Long commentId) {
        return ResponseEntity.ok(commentReactionService.getByComment(commentId));
    }
}
