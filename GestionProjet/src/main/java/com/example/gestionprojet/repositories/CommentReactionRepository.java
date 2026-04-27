package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.CommentReaction;
import com.example.gestionprojet.entities.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    Optional<CommentReaction> findByCommentIdAndUserIdAndReactionType(Long commentId, Long userId, ReactionType reactionType);

    List<CommentReaction> findByCommentIdOrderByCreatedAtDesc(Long commentId);
}
