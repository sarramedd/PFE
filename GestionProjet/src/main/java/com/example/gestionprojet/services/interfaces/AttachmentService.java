package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.Attachment;

import java.util.List;

public interface AttachmentService {
    Attachment uploadAttachment(Attachment attachment);

    Attachment getAttachmentById(Long id);

    List<Attachment> getAttachmentsByTask(Long taskId);

    Attachment updateAttachment(Long id, Attachment attachment);

    void deleteAttachment(Long id);
}
