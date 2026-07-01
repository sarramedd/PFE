package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.dto.MeetingRequest;
import com.example.gestionprojet.dto.MeetingResponse;
import com.example.gestionprojet.entities.AttendeeResponse;
import com.example.gestionprojet.entities.MeetingStatus;

import java.util.List;

public interface MeetingService {

    MeetingResponse create(MeetingRequest request);

    MeetingResponse update(Long id, MeetingRequest request);

    void delete(Long id);

    MeetingResponse getById(Long id);

    List<MeetingResponse> getByProject(Long projectId);

    List<MeetingResponse> getMyUpcomingMeetings();

    /** Toutes mes reunions (passees + futures), sans filtre de date. */
    List<MeetingResponse> getAllMyMeetings();

    MeetingResponse changeStatus(Long id, MeetingStatus status);

    MeetingResponse updateNotes(Long id, String notes);

    /** Pour un invite : repond a l'invitation. */
    MeetingResponse respond(Long meetingId, AttendeeResponse response);

    /**
     * Rejoint la reunion en ligne : passe le statut a IN_PROGRESS si SCHEDULED
     * et retourne la reponse enrichie (avec roomName).
     * Accessible a l'organisateur et aux invites ayant accepte.
     */
    MeetingResponse joinMeeting(Long id);
}
