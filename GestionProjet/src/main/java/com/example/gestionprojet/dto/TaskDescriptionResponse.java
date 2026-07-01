package com.example.gestionprojet.dto;

import java.util.ArrayList;
import java.util.List;

public class TaskDescriptionResponse {
    private String description;
    private List<String> acceptanceCriteria = new ArrayList<>();
    private Integer estimatedHours;
    private String suggestedPriority; // LOW | MEDIUM | HIGH
    private String model;

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<String> getAcceptanceCriteria() { return acceptanceCriteria; }
    public void setAcceptanceCriteria(List<String> acceptanceCriteria) {
        this.acceptanceCriteria = acceptanceCriteria != null ? acceptanceCriteria : new ArrayList<>();
    }
    public Integer getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(Integer estimatedHours) { this.estimatedHours = estimatedHours; }
    public String getSuggestedPriority() { return suggestedPriority; }
    public void setSuggestedPriority(String suggestedPriority) { this.suggestedPriority = suggestedPriority; }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}
