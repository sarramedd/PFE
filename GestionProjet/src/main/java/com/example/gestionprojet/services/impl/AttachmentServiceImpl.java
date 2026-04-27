package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Attachment;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.repositories.AttachmentRepository;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.AttachmentService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AttachmentServiceImpl implements AttachmentService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private TenantAccessService tenantAccessService;

    @Autowired
    private ProjectMemberRepository projectMemberRepository;
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private AuditLogServiceImpl auditLogService;

    public Attachment uploadAttachment(Long taskId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ValidationUtils.badRequest("Attachment file is required.");
        }

        Task task = resolveTask(taskId);
        String storedPath = storeFile(file);

        Attachment attachment = new Attachment();
        attachment.setTask(task);
        attachment.setProject(task.getProject());
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(storedPath);
        attachment.setUploadedAt(LocalDateTime.now());

        Attachment created = attachmentRepository.save(attachment);
        auditLogService.record("ATTACHMENT_UPLOADED", "TASK_ATTACHMENT", created.getId());
        return created;
    }

    public Attachment uploadProjectAttachment(Long projectId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ValidationUtils.badRequest("Attachment file is required.");
        }

        Project project = resolveProject(projectId);
        String storedPath = storeFile(file);

        Attachment attachment = new Attachment();
        attachment.setProject(project);
        attachment.setFileName(file.getOriginalFilename());
        attachment.setFilePath(storedPath);
        attachment.setUploadedAt(LocalDateTime.now());

        Attachment created = attachmentRepository.save(attachment);
        auditLogService.record("ATTACHMENT_UPLOADED", "PROJECT_ATTACHMENT", created.getId());
        return created;
    }

    @Override
    public Attachment uploadAttachment(Attachment attachment) {
        throw ValidationUtils.badRequest("Use multipart upload for attachments.");
    }

    @Override
    public Attachment getAttachmentById(Long id) {
        Attachment attachment = attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        if (attachment.getTask() != null) {
            validateTaskAccess(attachment.getTask());
        } else if (attachment.getProject() != null) {
            validateProjectAccess(attachment.getProject());
        }
        return attachment;
    }

    @Override
    public List<Attachment> getAttachmentsByTask(Long taskId) {
        Task task = resolveTask(taskId);
        return attachmentRepository.findByTaskIdAndTask_Project_Organization_IdOrderByUploadedAtDesc(
                task.getId(),
                tenantAccessService.getCurrentOrganizationId()
        );
    }

    public List<Attachment> getAttachmentsByProject(Long projectId) {
        Project project = resolveProject(projectId);
        return attachmentRepository.findByProjectIdAndProject_Organization_IdOrderByUploadedAtDesc(
                project.getId(),
                tenantAccessService.getCurrentOrganizationId()
        );
    }

    @Override
    public Attachment updateAttachment(Long id, Attachment attachment) {
        throw ValidationUtils.badRequest("Attachment metadata update is not supported.");
    }

    @Override
    public void deleteAttachment(Long id) {
        Attachment existing = getAttachmentById(id);

        try {
            String relativePath = existing.getFilePath();
            if (relativePath != null && relativePath.startsWith("/uploads/")) {
                Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
                Path filePath = uploadPath.resolve(relativePath.replaceFirst("^/uploads/", "")).normalize();
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
        }

        auditLogService.record("ATTACHMENT_DELETED", "TASK_ATTACHMENT", existing.getId());
        attachmentRepository.delete(existing);
    }

    private Task resolveTask(Long taskId) {
        Task task = tenantAccessService.isSuperAdmin()
                ? taskRepository.findById(taskId).orElseThrow(() -> new RuntimeException("Task not found"))
                : taskRepository.findByIdAndProject_Organization_Id(taskId, tenantAccessService.getCurrentOrganizationId())
                    .orElseThrow(() -> new RuntimeException("Task not found in your organization"));

        validateTaskAccess(task);
        return task;
    }

    private Project resolveProject(Long projectId) {
        Project project = tenantAccessService.isSuperAdmin()
                ? projectRepository.findById(projectId).orElseThrow(() -> new RuntimeException("Project not found"))
                : projectRepository.findByIdAndOrganizationId(projectId, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("Project not found in your organization"));

        validateProjectAccess(project);
        return project;
    }

    private void validateTaskAccess(Task task) {
        if (tenantAccessService.isSuperAdmin() || tenantAccessService.canManageProjects()) {
            return;
        }

        boolean isMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                task.getProject().getId(),
                tenantAccessService.getCurrentUserId(),
                tenantAccessService.getCurrentOrganizationId()
        );

        if (!isMember) {
            throw ValidationUtils.forbidden("You can only access attachments of your own projects.");
        }
    }

    private void validateProjectAccess(Project project) {
        if (tenantAccessService.isSuperAdmin() || tenantAccessService.canManageProjects()) {
            return;
        }

        boolean isMember = projectMemberRepository.existsByProjectIdAndUserIdAndProject_Organization_Id(
                project.getId(),
                tenantAccessService.getCurrentUserId(),
                tenantAccessService.getCurrentOrganizationId()
        );

        if (!isMember) {
            throw ValidationUtils.forbidden("You can only access attachments of your own projects.");
        }
    }

    private String storeFile(MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads", "task-attachments").toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = UUID.randomUUID() + "_" + original;
            Path targetPath = uploadPath.resolve(fileName).normalize();

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/task-attachments/" + fileName;
        } catch (IOException exception) {
            throw new RuntimeException("Could not store attachment file", exception);
        }
    }
}
