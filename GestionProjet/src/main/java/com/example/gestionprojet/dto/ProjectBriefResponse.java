package com.example.gestionprojet.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Reponse du endpoint GET /api/ai/project/{id}/brief.
 * Resume du projet genere par l'IA, structure pour etre directement
 * consommable par le frontend (chips, listes a puces, jauge d'avancement).
 */
public class ProjectBriefResponse {

    private Long projectId;
    private String projectName;
    private LocalDateTime generatedAt;
    private String model;

    /** Resume executif en une a deux phrases. */
    private String summary;

    /** Avancement estime du projet en pourcentage (0..100). */
    private Integer progressPercent;

    /** Niveau de risque global : LOW, MEDIUM, HIGH. */
    private String riskLevel;

    /** Risques identifies par l'IA. */
    private List<String> risks = new ArrayList<>();

    /** Blockers concrets a debloquer en priorite. */
    private List<String> blockers = new ArrayList<>();

    /** Recommandations actionables. */
    private List<String> suggestions = new ArrayList<>();

    public ProjectBriefResponse() {
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public Integer getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(Integer progressPercent) {
        this.progressPercent = progressPercent;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public List<String> getRisks() {
        return risks;
    }

    public void setRisks(List<String> risks) {
        this.risks = risks != null ? risks : new ArrayList<>();
    }

    public List<String> getBlockers() {
        return blockers;
    }

    public void setBlockers(List<String> blockers) {
        this.blockers = blockers != null ? blockers : new ArrayList<>();
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions != null ? suggestions : new ArrayList<>();
    }
}
