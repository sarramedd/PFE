package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.AutomationRule;
import com.example.gestionprojet.entities.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AutomationRuleRepository extends JpaRepository<AutomationRule, Long> {
    List<AutomationRule> findByOrganization_IdAndEnabledTrueAndTriggerStatus(Long organizationId, TaskStatus status);

    List<AutomationRule> findByOrganization_IdOrderByCreatedAtDesc(Long organizationId);
}
