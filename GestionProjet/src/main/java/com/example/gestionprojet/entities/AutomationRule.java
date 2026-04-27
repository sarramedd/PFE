package com.example.gestionprojet.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "automation_rules")
public class AutomationRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Enumerated(EnumType.STRING)
    private TaskStatus triggerStatus;

    @Enumerated(EnumType.STRING)
    private AutomationActionType actionType;

    private boolean enabled = true;

    private Integer followUpDelayDays = 3;

    @Column(length = 255)
    private String followUpTitleTemplate;

    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public TaskStatus getTriggerStatus() {
        return triggerStatus;
    }

    public void setTriggerStatus(TaskStatus triggerStatus) {
        this.triggerStatus = triggerStatus;
    }

    public AutomationActionType getActionType() {
        return actionType;
    }

    public void setActionType(AutomationActionType actionType) {
        this.actionType = actionType;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public Integer getFollowUpDelayDays() {
        return followUpDelayDays;
    }

    public void setFollowUpDelayDays(Integer followUpDelayDays) {
        this.followUpDelayDays = followUpDelayDays;
    }

    public String getFollowUpTitleTemplate() {
        return followUpTitleTemplate;
    }

    public void setFollowUpTitleTemplate(String followUpTitleTemplate) {
        this.followUpTitleTemplate = followUpTitleTemplate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
