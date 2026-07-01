package com.example.gestionprojet.controllers;

import com.example.gestionprojet.dto.AssigneeSuggestionRequest;
import com.example.gestionprojet.dto.AssigneeSuggestionResponse;
import com.example.gestionprojet.dto.DiscussionSummaryResponse;
import com.example.gestionprojet.dto.ProjectBriefResponse;
import com.example.gestionprojet.dto.RiskTasksResponse;
import com.example.gestionprojet.dto.TaskDescriptionRequest;
import com.example.gestionprojet.dto.TaskDescriptionResponse;
import com.example.gestionprojet.services.interfaces.AiAssistantService;
import com.example.gestionprojet.services.interfaces.AiBriefService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Endpoints IA contextuels.
 * Tous lecture seule (sauf que le frontend peut decider de PERSISTER
 * la description generee dans une tache via /api/tasks).
 */
@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiBriefService aiBriefService;
    private final AiAssistantService aiAssistantService;

    public AiController(AiBriefService aiBriefService, AiAssistantService aiAssistantService) {
        this.aiBriefService = aiBriefService;
        this.aiAssistantService = aiAssistantService;
    }

    /** Brief executif d'un projet (resume, risques, blockers, suggestions). */
    @GetMapping("/project/{id}/brief")
    public ResponseEntity<ProjectBriefResponse> getProjectBrief(@PathVariable Long id) {
        return ResponseEntity.ok(aiBriefService.generateProjectBrief(id));
    }

    /** Genere une description + criteres d'acceptation + estimation a partir d'un titre. */
    @PostMapping("/task/describe")
    public ResponseEntity<TaskDescriptionResponse> describeTask(
            @RequestBody TaskDescriptionRequest request) {
        return ResponseEntity.ok(aiAssistantService.describeTask(request));
    }

    /** Suggere les meilleurs membres du projet pour prendre une nouvelle tache. */
    @PostMapping("/task/suggest-assignee")
    public ResponseEntity<AssigneeSuggestionResponse> suggestAssignee(
            @RequestBody AssigneeSuggestionRequest request) {
        return ResponseEntity.ok(aiAssistantService.suggestAssignee(request));
    }

    /** Identifie les taches a risque de glissement dans un projet. */
    @GetMapping("/project/{id}/risk-tasks")
    public ResponseEntity<RiskTasksResponse> detectRiskTasks(@PathVariable Long id) {
        return ResponseEntity.ok(aiAssistantService.detectRiskTasks(id));
    }

    /** Resume la discussion (commentaires) d'un projet. */
    @GetMapping("/project/{id}/discussion-summary")
    public ResponseEntity<DiscussionSummaryResponse> summarizeDiscussion(@PathVariable Long id) {
        return ResponseEntity.ok(aiAssistantService.summarizeDiscussion(id));
    }
}
