package com.example.gestionprojet.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * Notification utilisateur.
 *
 * NE PAS utiliser @Getter @Setter de Lombok ici : le champ Boolean "isRead"
 * provoque des conflits de noms de getters entre Lombok (getIsRead) et le
 * standard Java Bean (isRead). On ecrit explicitement getter/setter avec
 * une annotation @JsonProperty pour figer le nom serialise cote API.
 */
@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type = NotificationType.GENERAL;

    /**
     * Etat lu / non lu. Annotation sur le champ : Jackson serialisera
     * TOUJOURS sous la cle "isRead" dans la reponse JSON, quel que soit
     * le nom de la methode getter utilisee derriere.
     */
    @JsonProperty("isRead")
    private Boolean isRead = false;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Notification() {
    }

    public Notification(Long id, String message, NotificationType type, Boolean isRead,
                        LocalDateTime createdAt, LocalDateTime readAt, User user) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.readAt = readAt;
        this.user = user;
    }

    // ---------- Getters ----------

    public Long getId() { return id; }
    public String getMessage() { return message; }
    public NotificationType getType() { return type; }

    /** Lecture du flag de lecture. Le nom JSON est figure par @JsonProperty sur le champ. */
    public Boolean getIsRead() { return isRead; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getReadAt() { return readAt; }
    public User getUser() { return user; }

    // ---------- Setters ----------

    public void setId(Long id) { this.id = id; }
    public void setMessage(String message) { this.message = message; }
    public void setType(NotificationType type) { this.type = type; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setReadAt(LocalDateTime readAt) { this.readAt = readAt; }
    public void setUser(User user) { this.user = user; }

    /**
     * Setter principal : met aussi a jour readAt automatiquement
     * (utilise par la deserialisation Jackson et par le code metier).
     */
    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
        this.readAt = Boolean.TRUE.equals(isRead) ? LocalDateTime.now() : null;
    }

    /** Alias historique conserve pour le code metier (NotificationServiceImpl.markAsRead). */
    public void setRead(Boolean read) {
        setIsRead(read);
    }
}
