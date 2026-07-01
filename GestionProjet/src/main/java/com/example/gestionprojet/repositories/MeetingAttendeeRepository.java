package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.MeetingAttendee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MeetingAttendeeRepository extends JpaRepository<MeetingAttendee, Long> {

    List<MeetingAttendee> findByMeetingId(Long meetingId);

    List<MeetingAttendee> findByUserIdOrderByMeeting_ScheduledAtDesc(Long userId);

    Optional<MeetingAttendee> findByMeetingIdAndUserId(Long meetingId, Long userId);

    void deleteByMeetingId(Long meetingId);
}
