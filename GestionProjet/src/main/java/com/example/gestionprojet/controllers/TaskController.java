package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.services.impl.TaskServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {
    @Autowired
    private TaskServiceImpl taskService;
    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        Task created = taskService.createTask(task);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskService.getTaskById(id);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskService.getAllTasks();
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long projectId) {
        List<Task> tasks = taskService.getTasksByProject(projectId);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = taskService.getTasksByUser(userId);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<Task>> getTasksByProjectAndStatus(
            @PathVariable Long projectId,
            @PathVariable TaskStatus status) {
        List<Task> tasks = taskService.getTasksByProjectAndStatus(projectId, status);
        return new ResponseEntity<>(tasks, HttpStatus.OK);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Task> changeStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status) {
        Task updated = taskService.changeStatus(id, status);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        Task updated = taskService.updateTask(id, task);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
