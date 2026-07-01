package com.example.gestionprojet.dto;

/** Requete : l'utilisateur tape un titre court, l'IA enrichit. */
public class TaskDescriptionRequest {
    private String title;
    private Long projectId; // optionnel : pour ancrer le contexte projet
    private String language; // optionnel : "fr" (defaut) ou "en"

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }
}
