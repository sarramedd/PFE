package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Attachment;
import com.example.gestionprojet.services.impl.AttachmentServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")

public class AttachmentController {
    @Autowired
    private AttachmentServiceImpl attachmentService;
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Attachment> uploadAttachment(
            @RequestParam Long taskId,
            @RequestPart("file") MultipartFile file) {
        Attachment uploaded = attachmentService.uploadAttachment(taskId, file);
        return new ResponseEntity<>(uploaded, HttpStatus.CREATED);
    }

    @PostMapping(value = "/project", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Attachment> uploadProjectAttachment(
            @RequestParam Long projectId,
            @RequestPart("file") MultipartFile file
    ) {
        Attachment uploaded = attachmentService.uploadProjectAttachment(projectId, file);
        return new ResponseEntity<>(uploaded, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable Long id) {
        Attachment attachment = attachmentService.getAttachmentById(id);
        return new ResponseEntity<>(attachment, HttpStatus.OK);
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByTask(@PathVariable Long taskId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByTask(taskId);
        return new ResponseEntity<>(attachments, HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByProject(@PathVariable Long projectId) {
        List<Attachment> attachments = attachmentService.getAttachmentsByProject(projectId);
        return new ResponseEntity<>(attachments, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
