package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.CommentReaction;
import com.example.gestionprojet.entities.ReactionType;
import com.example.gestionprojet.repositories.CommentReactionRepository;
import com.example.gestionprojet.repositories.CommentRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentReactionServiceImpl {
    private final CommentReactionRepository commentReactionRepository;
    private final CommentRepository commentRepository;
    private final TenantAccessService tenantAccessService;
    private final AuditLogServiceImpl auditLogService;

    public CommentReactionServiceImpl(
            CommentReactionRepository commentReactionRepository,
            CommentRepository commentRepository,
            TenantAccessService tenantAccessService,
            AuditLogServiceImpl auditLogService
    ) {
        this.commentReactionRepository = commentReactionRepository;
        this.commentRepository = commentRepository;
        this.tenantAccessService = tenantAccessService;
        this.auditLogService = auditLogService;
    }

    public CommentReaction addReaction(Long commentId, ReactionType reactionType) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (comment.getProject() == null || comment.getProject().getOrganization() == null
                || !comment.getProject().getOrganization().getId().equals(tenantAccessService.getCurrentOrganizationId())) {
            throw ValidationUtils.forbidden("Comment is not in your organization.");
        }

        return commentReactionRepository.findByCommentIdAndUserIdAndReactionType(
                        commentId,
                        tenantAccessService.getCurrentUserId(),
                        reactionType)
                .orElseGet(() -> {
                    CommentReaction reaction = new CommentReaction();
                    reaction.setComment(comment);
                    reaction.setUser(tenantAccessService.getCurrentUser());
                    reaction.setReactionType(reactionType);
                    reaction.setCreatedAt(LocalDateTime.now());
                    CommentReaction created = commentReactionRepository.save(reaction);
                    auditLogService.record("COMMENT_REACTED", "COMMENT_REACTION", created.getId());
                    return created;
                });
    }

    public void removeReaction(Long commentId, ReactionType reactionType) {
        CommentReaction reaction = commentReactionRepository.findByCommentIdAndUserIdAndReactionType(
                        commentId,
                        tenantAccessService.getCurrentUserId(),
                        reactionType)
                .orElseThrow(() -> new RuntimeException("Reaction not found"));
        commentReactionRepository.delete(reaction);
        auditLogService.record("COMMENT_REACTION_REMOVED", "COMMENT_REACTION", reaction.getId());
    }

    public List<CommentReaction> getByComment(Long commentId) {
        return commentReactionRepository.findByCommentIdOrderByCreatedAtDesc(commentId);
    }
}
