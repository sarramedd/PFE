package com.example.gestionprojet.dto;

public class AssigneeSuggestionRequest {
    private Long projectId;
    private String title;
    private String description;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
