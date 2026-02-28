package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Attachment;
import com.example.gestionprojet.services.impl.AttachmentServiceImpl;
import com.example.gestionprojet.services.interfaces.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attachments")

public class AttachmentController {
    @Autowired
    private AttachmentServiceImpl attachmentService;
    @PostMapping
    public ResponseEntity<Attachment> uploadAttachment(@RequestBody Attachment attachment) {
        Attachment uploaded = attachmentService.uploadAttachment(attachment);
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

    @PutMapping("/{id}")
    public ResponseEntity<Attachment> updateAttachment(@PathVariable Long id, @RequestBody Attachment attachment) {
        Attachment updated = attachmentService.updateAttachment(id, attachment);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        attachmentService.deleteAttachment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
