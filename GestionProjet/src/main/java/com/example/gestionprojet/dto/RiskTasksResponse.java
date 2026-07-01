package com.example.gestionprojet.dto;

import java.util.ArrayList;
import java.util.List;

public class RiskTasksResponse {
    private Long projectId;
    private List<RiskTask> atRiskTasks = new ArrayList<>();
    private String model;

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public List<RiskTask> getAtRiskTasks() { return atRiskTasks; }
    public void setAtRiskTasks(List<RiskTask> atRiskTasks) {
        this.atRiskTasks = atRiskTasks != null ? atRiskTasks : new ArrayList<>();
    }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public static class RiskTask {
        private Long taskId;
        private String title;
        private String status;
        private String dueDate;
        private String assignedTo;
        private int riskScore;     // 0..100
        private String riskLevel;  // LOW | MEDIUM | HIGH
        private String reason;     // pourquoi cette tache est a risque
        private String recommendation; // que faire

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getDueDate() { return dueDate; }
        public void setDueDate(String dueDate) { this.dueDate = dueDate; }
        public String getAssignedTo() { return assignedTo; }
        public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }
        public int getRiskScore() { return riskScore; }
        public void setRiskScore(int riskScore) { this.riskScore = riskScore; }
        public String getRiskLevel() { return riskLevel; }
        public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
        public String getRecommendation() { return recommendation; }
        public void setRecommendation(String recommendation) { this.recommendation = recommendation; }
    }
}
