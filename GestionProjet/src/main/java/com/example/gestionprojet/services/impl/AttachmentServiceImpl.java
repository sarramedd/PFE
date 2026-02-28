package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Attachment;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.repositories.AttachmentRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.services.interfaces.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
@Service
public class AttachmentServiceImpl implements AttachmentService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Override
    public Attachment uploadAttachment(Attachment attachment) {
        if (attachment.getTask() != null) {
            Task task = taskRepository.findById(attachment.getTask().getId())
                    .orElseThrow(() -> new RuntimeException("Task not found"));
            attachment.setTask(task);
        }
        attachment.setUploadedAt(LocalDateTime.now());
        return attachmentRepository.save(attachment);
    }

    @Override
    public Attachment getAttachmentById(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    @Override
    public List<Attachment> getAttachmentsByTask(Long taskId) {
        return attachmentRepository.findByTaskId(taskId);
    }

    @Override
    public Attachment updateAttachment(Long id, Attachment attachment) {
        Attachment existing = getAttachmentById(id);
        existing.setFileName(attachment.getFileName());
        existing.setFilePath(attachment.getFilePath());
        return attachmentRepository.save(existing);
    }

    @Override
    public void deleteAttachment(Long id) {
        Attachment existing = getAttachmentById(id);
        attachmentRepository.delete(existing);
    }
}