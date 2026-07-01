package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.dto.AssigneeSuggestionRequest;
import com.example.gestionprojet.dto.AssigneeSuggestionResponse;
import com.example.gestionprojet.dto.DiscussionSummaryResponse;
import com.example.gestionprojet.dto.RiskTasksResponse;
import com.example.gestionprojet.dto.TaskDescriptionRequest;
import com.example.gestionprojet.dto.TaskDescriptionResponse;

public interface AiAssistantService {

    /** Genere une description riche + criteres + estimation a partir d'un titre. */
    TaskDescriptionResponse describeTask(TaskDescriptionRequest request);

    /** Propose les meilleurs membres pour prendre une tache. */
    AssigneeSuggestionResponse suggestAssignee(AssigneeSuggestionRequest request);

    /** Identifie les taches d'un projet a risque de glissement. */
    RiskTasksResponse detectRiskTasks(Long projectId);

    /** Resume une longue discussion (commentaires) d'un projet. */
    DiscussionSummaryResponse summarizeDiscussion(Long projectId);
}
