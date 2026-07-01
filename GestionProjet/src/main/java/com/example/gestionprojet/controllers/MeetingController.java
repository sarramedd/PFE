package com.example.gestionprojet.controllers;

import com.example.gestionprojet.dto.MeetingRequest;
import com.example.gestionprojet.dto.MeetingResponse;
import com.example.gestionprojet.entities.AttendeeResponse;
import com.example.gestionprojet.entities.MeetingStatus;
import com.example.gestionprojet.services.interfaces.MeetingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    /** Cree une nouvelle reunion (PM / Org Admin uniquement). */
    @PostMapping
    public ResponseEntity<MeetingResponse> create(@RequestBody MeetingRequest request) {
        return new ResponseEntity<>(meetingService.create(request), HttpStatus.CREATED);
    }

    /** Modifie une reunion existante. */
    @PutMapping("/{id}")
    public ResponseEntity<MeetingResponse> update(@PathVariable Long id,
                                                  @RequestBody MeetingRequest request) {
        return ResponseEntity.ok(meetingService.update(id, request));
    }

    /** Supprime une reunion. */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        meetingService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /** Detail d'une reunion (titre, agenda, invites, statut). */
    @GetMapping("/{id}")
    public ResponseEntity<MeetingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.getById(id));
    }

    /** Liste les reunions d'un projet, triees par date desc. */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<MeetingResponse>> getByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(meetingService.getByProject(projectId));
    }

    /** Mes reunions a venir (organisees + invitations recues). */
    @GetMapping("/me")
    public ResponseEntity<List<MeetingResponse>> getMyMeetings() {
        return ResponseEntity.ok(meetingService.getMyUpcomingMeetings());
    }

    /** Toutes mes reunions (passees + futures). */
    @GetMapping("/me/all")
    public ResponseEntity<List<MeetingResponse>> getAllMyMeetings() {
        return ResponseEntity.ok(meetingService.getAllMyMeetings());
    }

    /** Change le statut (SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED). */
    @PatchMapping("/{id}/status")
    public ResponseEntity<MeetingResponse> changeStatus(@PathVariable Long id,
                                                        @RequestBody Map<String, String> body) {
        MeetingStatus status = MeetingStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(meetingService.changeStatus(id, status));
    }

    /** Edite les notes (compte-rendu). */
    @PatchMapping("/{id}/notes")
    public ResponseEntity<MeetingResponse> updateNotes(@PathVariable Long id,
                                                       @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(meetingService.updateNotes(id, body.get("notes")));
    }

    /** Repondre a une invitation : ACCEPTED ou DECLINED. */
    @PostMapping("/{id}/respond")
    public ResponseEntity<MeetingResponse> respond(@PathVariable Long id,
                                                   @RequestBody Map<String, String> body) {
        AttendeeResponse resp = AttendeeResponse.valueOf(body.get("response"));
        return ResponseEntity.ok(meetingService.respond(id, resp));
    }

    /**
     * Rejoindre la reunion en ligne.
     * Passe automatiquement le statut a IN_PROGRESS si encore SCHEDULED.
     * Retourne roomName pour que le frontend initialise Jitsi.
     */
    @PostMapping("/{id}/join")
    public ResponseEntity<MeetingResponse> joinMeeting(@PathVariable Long id) {
        return ResponseEntity.ok(meetingService.joinMeeting(id));
    }
}
