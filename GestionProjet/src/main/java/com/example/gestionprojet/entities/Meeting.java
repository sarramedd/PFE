package com.example.gestionprojet.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "meetings")
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(length = 4000)
    private String agenda;

    @Column(length = 4000)
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingType type = MeetingType.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    /** Modalite de participation : presentiel, en ligne ou hybride. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MeetingModality modality = MeetingModality.PRESENTIEL;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer durationMinutes = 30;

    /** Projet associe (optionnel — une reunion peut exister sans projet). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = true)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    private User organizer;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /** Nom unique de la salle Jitsi, genere a la creation, immuable. */
    @Column(unique = true, length = 100)
    private String roomName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public MeetingStatus getStatus() { return status; }
    public void setStatus(MeetingStatus status) { this.status = status; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public User getOrganizer() { return organizer; }
    public void setOrganizer(User organizer) { this.organizer = organizer; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }
    public MeetingModality getModality() { return modality; }
    public void setModality(MeetingModality modality) { this.modality = modality; }
}
