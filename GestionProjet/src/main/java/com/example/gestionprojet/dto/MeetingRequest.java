package com.example.gestionprojet.dto;

import com.example.gestionprojet.entities.MeetingModality;
import com.example.gestionprojet.entities.MeetingType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MeetingRequest {
    private Long projectId;          // optionnel — reunion hors projet possible
    private String title;
    private String description;
    private String agenda;
    private MeetingType type;
    private MeetingModality modality; // PRESENTIEL | EN_LIGNE | HYBRIDE
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private List<Long> attendeeUserIds = new ArrayList<>();

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }
    public MeetingType getType() { return type; }
    public void setType(MeetingType type) { this.type = type; }
    public MeetingModality getModality() { return modality; }
    public void setModality(MeetingModality modality) { this.modality = modality; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public List<Long> getAttendeeUserIds() { return attendeeUserIds; }
    public void setAttendeeUserIds(List<Long> attendeeUserIds) {
        this.attendeeUserIds = attendeeUserIds != null ? attendeeUserIds : new ArrayList<>();
    }
}
