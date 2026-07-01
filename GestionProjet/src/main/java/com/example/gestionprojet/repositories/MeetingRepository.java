package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.Meeting;
import com.example.gestionprojet.entities.MeetingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByProjectIdOrderByScheduledAtDesc(Long projectId);

    List<Meeting> findByProjectIdAndProject_Organization_IdOrderByScheduledAtDesc(
            Long projectId, Long organizationId);

    List<Meeting> findByProject_Organization_IdOrderByScheduledAtDesc(Long organizationId);

    List<Meeting> findByOrganizerIdOrderByScheduledAtDesc(Long organizerId);

    List<Meeting> findByStatusAndScheduledAtBefore(MeetingStatus status, LocalDateTime cutoff);
}
