package com.example.gestionprojet.dto;

import java.util.ArrayList;
import java.util.List;

public class DiscussionSummaryResponse {
    private Long projectId;
    private int totalComments;
    private String summary;             // 3-5 lignes
    private List<String> keyPoints = new ArrayList<>();
    private List<String> decisions = new ArrayList<>();
    private List<String> openQuestions = new ArrayList<>();
    private String model;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public int getTotalComments() { return totalComments; }
    public void setTotalComments(int totalComments) { this.totalComments = totalComments; }
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    public List<String> getKeyPoints() { return keyPoints; }
    public void setKeyPoints(List<String> keyPoints) {
        this.keyPoints = keyPoints != null ? keyPoints : new ArrayList<>();
    }
    public List<String> getDecisions() { return decisions; }
    public void setDecisions(List<String> decisions) {
        this.decisions = decisions != null ? decisions : new ArrayList<>();
    }
    public List<String> getOpenQuestions() { return openQuestions; }
    public void setOpenQuestions(List<String> openQuestions) {
        this.openQuestions = openQuestions != null ? openQuestions : new ArrayList<>();
    }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }
}
