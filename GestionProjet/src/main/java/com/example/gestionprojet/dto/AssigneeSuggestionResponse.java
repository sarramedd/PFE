package com.example.gestionprojet.dto;

import java.util.ArrayList;
import java.util.List;

public class AssigneeSuggestionResponse {

    private List<Suggestion> suggestions = new ArrayList<>();
    private String model;

    public List<Suggestion> getSuggestions() { return suggestions; }
    public void setSuggestions(List<Suggestion> suggestions) {
        this.suggestions = suggestions != null ? suggestions : new ArrayList<>();
    }
    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public static class Suggestion {
        private Long userId;
        private String name;
        private String email;
        private int score;        // 0..100, indice de pertinence
        private int currentLoad;  // nombre de taches actives assignees
        private String reason;    // explication courte

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public int getCurrentLoad() { return currentLoad; }
        public void setCurrentLoad(int currentLoad) { this.currentLoad = currentLoad; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
