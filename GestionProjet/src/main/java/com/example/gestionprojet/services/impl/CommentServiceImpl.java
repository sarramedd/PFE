package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.entities.NotificationType;
import com.example.gestionprojet.repositories.CommentRepository;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.CommentService;
import com.example.gestionprojet.validation.ValidationUtils;
import com.example.gestionprojet.websocket.WebSocketSessionRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CommentServiceImpl implements CommentService {
    private static final Pattern EMAIL_MENTION_PATTERN = Pattern.compile("@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,})");
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private TaskRepository taskRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    @Autowired
    private TenantAccessService tenantAccessService;
    @Autowired
    private NotificationServiceImpl notificationService;
    @Autowired
    private AuditLogServiceImpl auditLogService;
    @Autowired
    private WebSocketSessionRegistry webSocketSessionRegistry;

    @Override
    public Comment createComment(Comment comment) {
        comment.setContent(ValidationUtils.requireTrimmedText(comment.getContent(), "Message", 1, 2000));

        User author = tenantAccessService.getCurrentUser();
        comment.setAuthor(author);

        if (comment.getProject() != null && comment.getProject().getId() != null) {
            Project project = resolveProject(comment.getProject().getId());
            comment.setProject(project);
            comment.setTask(null);
        } else if (comment.getTask() != null && comment.getTask().getId() != null) {
            Task task = taskRepository.findByIdAndProject_Organization_Id(
                            comment.getTask().getId(),
                            tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Task not found in your organization"));
            enforceProjectMembership(task.getProject().getId());
            comment.setTask(task);
            comment.setProject(task.getProject());
        } else {
            throw ValidationUtils.badRequest("A project or task is required.");
        }

        comment.setCreatedAt(LocalDateTime.now());
        Comment createdComment = commentRepository.save(comment);
        auditLogService.record("COMMENT_CREATED", "TASK_COMMENT", createdComment.getId());
        if (createdComment.getProject() != null && createdComment.getProject().getId() != null) {
            webSocketSessionRegistry.publishProjectMessage(createdComment.getProject().getId(), createdComment);
        }

        notifyProjectMembers(createdComment);
        notifyMentions(createdComment);
        return createdComment;
    }

    @Override
    public Comment updateComment(Long id, Comment comment) {
        Comment existing = getCommentById(id);

        if (!existing.getAuthor().getId().equals(tenantAccessService.getCurrentUserId()) && !tenantAccessService.canManageProjects()) {
            throw ValidationUtils.forbidden("You cannot edit this message.");
        }

        existing.setContent(ValidationUtils.requireTrimmedText(comment.getContent(), "Message", 1, 2000));
        Comment updated = commentRepository.save(existing);
        auditLogService.record("COMMENT_UPDATED", "TASK_COMMENT", updated.getId());
        return updated;
    }

    @Override
    public void deleteComment(Long id) {
        Comment comment = getCommentById(id);
        if (!comment.getAuthor().getId().equals(tenantAccessService.getCurrentUserId()) && !tenantAccessService.canManageProjects()) {
            throw ValidationUtils.forbidden("You cannot delete this message.");
        }
        auditLogService.record("COMMENT_DELETED", "TASK_COMMENT", comment.getId());
        commentRepository.delete(comment);
    }

    @Override
    public Comment getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (comment.getProject() != null) {
            tenantAccessService.validateSameOrganization(comment.getProject());
            if (tenantAccessService.isMember()) {
                enforceProjectMembership(comment.getProject().getId());
            }
        } else if (comment.getTask() != null) {
            tenantAccessService.validateSameOrganization(comment.getTask().getProject());
        }

        return comment;
    }

    @Override
    public List<Comment> getCommentsByTask(Long taskId) {
        Task task = taskRepository.findByIdAndProject_Organization_Id(taskId, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Task not found in your organization"));
        enforceProjectMembership(task.getProject().getId());
        return commentRepository.findByTaskIdAndTask_Project_Organization_IdOrderByCreatedAtAsc(
                taskId,
                tenantAccessService.getCurrentOrganizationId()
        );
    }

    @Override
    public List<Comment> getCommentsByProject(Long projectId) {
        resolveProject(projectId);
        return tenantAccessService.isSuperAdmin()
                ? commentRepository.findByProjectIdOrderByCreatedAtAsc(projectId)
                : commentRepository.findByProjectIdAndProject_Organization_IdOrderByCreatedAtAsc(projectId, tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public List<Comment> getCommentsByAuthor(Long authorId) {
        if (!tenantAccessService.isSuperAdmin() && !tenantAccessService.getCurrentUserId().equals(authorId)) {
            throw ValidationUtils.forbidden("You can only access your own messages.");
        }
        return commentRepository.findByAuthorId(authorId);
    }

    private Project resolveProject(Long projectId) {
        Project project = tenantAccessService.isSuperAdmin()
                ? projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"))
                : projectRepository.findByIdAndOrganizationId(projectId, tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Project not found in your organization"));

        enforceProjectMembership(projectId);
        return project;
    }

    private void enforceProjectMembership(Long projectId) {
        if (tenantAccessService.isSuperAdmin() || tenantAccessService.canManageProjects()) {
            return;
        }

        boolean isMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                projectId,
                tenantAccessService.getCurrentUserId(),
                tenantAccessService.getCurrentOrganizationId()
        );

        if (!isMember) {
            throw ValidationUtils.forbidden("You can only access messages of your own projects.");
        }
    }

    private void notifyProjectMembers(Comment comment) {
        if (comment.getProject() == null) {
            return;
        }

        List<User> users = projectMemberRepository
                .findByProjectIdAndProject_Organization_Id(comment.getProject().getId(), comment.getProject().getOrganization().getId())
                .stream()
                .map(ProjectMember::getUser)
                .toList();

        String authorName = comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName();
        notificationService.notifyUsers(
                users,
                "New message from " + authorName + " in project \"" + comment.getProject().getName() + "\".",
                comment.getAuthor().getId(),
                NotificationType.TASK_UPDATE
        );
    }

    private void notifyMentions(Comment comment) {
        if (comment.getContent() == null || comment.getContent().isBlank()) {
            return;
        }

        Matcher matcher = EMAIL_MENTION_PATTERN.matcher(comment.getContent());
        Set<String> emails = new HashSet<>();
        while (matcher.find()) {
            emails.add(matcher.group(1).toLowerCase());
        }

        if (emails.isEmpty()) {
            return;
        }

        String authorName = comment.getAuthor().getFirstName() + " " + comment.getAuthor().getLastName();
        for (String email : emails) {
            userRepository.findByEmailAndOrganizationId(email, tenantAccessService.getCurrentOrganizationId())
                    .filter(user -> !user.getId().equals(comment.getAuthor().getId()))
                    .ifPresent(user -> notificationService.createForUser(
                            user,
                            "You were mentioned by " + authorName + " in project \"" + comment.getProject().getName() + "\".",
                            NotificationType.COMMENT_MENTION
                    ));
        }
    }
}
