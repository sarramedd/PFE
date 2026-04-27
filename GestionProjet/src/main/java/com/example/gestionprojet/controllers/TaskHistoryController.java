package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.TaskHistory;
import com.example.gestionprojet.services.impl.TaskHistoryServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/task-history")
public class TaskHistoryController {
    private final TaskHistoryServiceImpl taskHistoryService;

    public TaskHistoryController(TaskHistoryServiceImpl taskHistoryService) {
        this.taskHistoryService = taskHistoryService;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TaskHistory>> getByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(taskHistoryService.getByTask(taskId));
    }
}
