package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByTaskId(Long taskId);

    List<Attachment> findByTaskIdAndTask_Project_Organization_IdOrderByUploadedAtDesc(Long taskId, Long organizationId);

    List<Attachment> findByProjectIdAndProject_Organization_IdOrderByUploadedAtDesc(Long projectId, Long organizationId);

}
