package com.example.gestionprojet.dto;

import com.example.gestionprojet.entities.AttendeeResponse;
import com.example.gestionprojet.entities.MeetingModality;
import com.example.gestionprojet.entities.MeetingStatus;
import com.example.gestionprojet.entities.MeetingType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MeetingResponse {
    private Long id;
    private Long projectId;
    private String projectName;
    private String title;
    private String description;
    private String agenda;
    private String notes;
    private MeetingType type;
    private MeetingModality modality;
    private MeetingStatus status;
    private LocalDateTime scheduledAt;
    private Integer durationMinutes;
    private Long organizerId;
    private String organizerName;
    private LocalDateTime createdAt;
    private String roomName;
    private List<AttendeeDto> attendees = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getAgenda() { return agenda; }
    public void setAgenda(String agenda) { this.agenda = agenda; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public MeetingType getType() { return type; }
    public void setType(MeetingType type) { this.type = type; }
    public MeetingModality getModality() { return modality; }
    public void setModality(MeetingModality modality) { this.modality = modality; }
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }
    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public List<AttendeeDto> getAttendees() { return attendees; }
    public void setAttendees(List<AttendeeDto> attendees) { this.attendees = attendees; }

    public static class AttendeeDto {
        private Long userId;
        private String name;
        private String email;
        private AttendeeResponse response;
        private LocalDateTime respondedAt;

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public AttendeeResponse getResponse() { return response; }
        public void setResponse(AttendeeResponse response) { this.response = response; }
        public LocalDateTime getRespondedAt() { return respondedAt; }
        public void setRespondedAt(LocalDateTime respondedAt) { this.respondedAt = respondedAt; }
    }
}
