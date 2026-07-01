package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.dto.ProjectBriefResponse;

public interface AiBriefService {

    /**
     * Genere un resume executif d'un projet via IA.
     * Collecte le contexte (taches, commentaires, audit, worklogs)
     * puis interroge l'IA pour produire un brief structure.
     */
    ProjectBriefResponse generateProjectBrief(Long projectId);
}
