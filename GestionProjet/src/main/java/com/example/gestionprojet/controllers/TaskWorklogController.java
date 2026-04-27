package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.TaskWorklog;
import com.example.gestionprojet.services.impl.TaskWorklogServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/worklogs")
public class TaskWorklogController {
    private final TaskWorklogServiceImpl taskWorklogService;

    public TaskWorklogController(TaskWorklogServiceImpl taskWorklogService) {
        this.taskWorklogService = taskWorklogService;
    }

    @PostMapping
    public ResponseEntity<TaskWorklog> create(@RequestBody TaskWorklog payload) {
        return new ResponseEntity<>(taskWorklogService.logTime(payload), HttpStatus.CREATED);
    }

    @PostMapping("/timer/start")
    public ResponseEntity<Map<String, Object>> startTimer(@RequestParam Long taskId) {
        return ResponseEntity.ok(taskWorklogService.startTimer(taskId));
    }

    @PostMapping("/timer/stop")
    public ResponseEntity<TaskWorklog> stopTimer(@RequestBody(required = false) TimerStopRequest request) {
        String notes = request == null ? null : request.getNotes();
        return ResponseEntity.ok(taskWorklogService.stopTimer(notes));
    }

    @GetMapping("/timer/active")
    public ResponseEntity<Map<String, Object>> getActiveTimer() {
        return ResponseEntity.ok(taskWorklogService.getActiveTimer());
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskWorklog>> getByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskWorklogService.getByTask(taskId));
    }

    @GetMapping("/task/{taskId}/summary")
    public ResponseEntity<Map<String, Object>> getTaskSummary(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskWorklogService.getTaskSummary(taskId));
    }

    public static class TimerStopRequest {
        private String notes;

        public String getNotes() {
            return notes;
        }

        public void setNotes(String notes) {
            this.notes = notes;
        }
    }
}
