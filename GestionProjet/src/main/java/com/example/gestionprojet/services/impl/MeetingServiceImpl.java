package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.dto.MeetingRequest;
import com.example.gestionprojet.dto.MeetingResponse;
import com.example.gestionprojet.entities.AttendeeResponse;
import com.example.gestionprojet.entities.Meeting;
import com.example.gestionprojet.entities.MeetingAttendee;
import com.example.gestionprojet.entities.MeetingModality;
import com.example.gestionprojet.entities.MeetingStatus;
import com.example.gestionprojet.entities.MeetingType;
import com.example.gestionprojet.entities.Notification;
import com.example.gestionprojet.entities.NotificationType;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.MeetingAttendeeRepository;
import com.example.gestionprojet.repositories.MeetingRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.MeetingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Service metier des reunions.
 *
 * Regles d'acces :
 *   - Creation / modification / suppression : PM, Org Admin, Super Admin
 *   - Lecture d'une reunion : organizer + invites + admins de la meme org
 *   - Repondre a l'invitation : seul l'invite concerne
 */
@Service
public class MeetingServiceImpl implements MeetingService {

    private final MeetingRepository meetingRepository;
    private final MeetingAttendeeRepository attendeeRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationServiceImpl notificationService;
    private final AuditLogServiceImpl auditLogService;
    private final TenantAccessService tenantAccessService;

    public MeetingServiceImpl(MeetingRepository meetingRepository,
                              MeetingAttendeeRepository attendeeRepository,
                              ProjectRepository projectRepository,
                              UserRepository userRepository,
                              NotificationServiceImpl notificationService,
                              AuditLogServiceImpl auditLogService,
                              TenantAccessService tenantAccessService) {
        this.meetingRepository = meetingRepository;
        this.attendeeRepository = attendeeRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
        this.tenantAccessService = tenantAccessService;
    }

    // ===== CREATE =====

    @Override
    @Transactional
    public MeetingResponse create(MeetingRequest request) {
        // Permission : seul PM/Org Admin/Super Admin peut planifier une reunion
        tenantAccessService.assertCanManageProjects();
        validateRequest(request, true);

        // Le projet est optionnel
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Projet introuvable"));
            tenantAccessService.validateSameOrganization(project);
        }

        Meeting meeting = new Meeting();
        meeting.setTitle(request.getTitle());
        meeting.setDescription(request.getDescription());
        meeting.setAgenda(request.getAgenda());
        meeting.setType(request.getType() != null ? request.getType() : MeetingType.OTHER);
        meeting.setModality(request.getModality() != null ? request.getModality() : MeetingModality.PRESENTIEL);
        meeting.setScheduledAt(request.getScheduledAt());
        meeting.setDurationMinutes(request.getDurationMinutes() != null
                ? request.getDurationMinutes() : 30);
        meeting.setStatus(MeetingStatus.SCHEDULED);
        meeting.setProject(project);
        meeting.setOrganizer(tenantAccessService.getCurrentUser());
        meeting.setCreatedAt(LocalDateTime.now());
        // Generer une salle Jitsi pour les reunions en ligne ou hybrides
        if (meeting.getModality() == MeetingModality.EN_LIGNE
                || meeting.getModality() == MeetingModality.HYBRIDE) {
            meeting.setRoomName("gestionprojet-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        }

        Meeting saved = meetingRepository.save(meeting);

        // Ajout des invites + notifications
        for (Long userId : request.getAttendeeUserIds()) {
            addAttendee(saved, userId);
        }

        auditLogService.record("MEETING_CREATED", "MEETING", saved.getId());
        return toDto(saved);
    }

    // ===== UPDATE =====

    @Override
    @Transactional
    public MeetingResponse update(Long id, MeetingRequest request) {
        tenantAccessService.assertCanManageProjects();
        validateRequest(request, false);

        Meeting meeting = loadAndCheck(id);
        if (request.getTitle() != null) meeting.setTitle(request.getTitle());
        if (request.getDescription() != null) meeting.setDescription(request.getDescription());
        if (request.getAgenda() != null) meeting.setAgenda(request.getAgenda());
        if (request.getType() != null) meeting.setType(request.getType());
        if (request.getScheduledAt() != null) meeting.setScheduledAt(request.getScheduledAt());
        if (request.getDurationMinutes() != null) meeting.setDurationMinutes(request.getDurationMinutes());

        Meeting saved = meetingRepository.save(meeting);
        auditLogService.record("MEETING_UPDATED", "MEETING", saved.getId());
        return toDto(saved);
    }

    // ===== DELETE =====

    @Override
    @Transactional
    public void delete(Long id) {
        tenantAccessService.assertCanManageProjects();
        Meeting meeting = loadAndCheck(id);
        attendeeRepository.deleteByMeetingId(meeting.getId());
        meetingRepository.delete(meeting);
        auditLogService.record("MEETING_DELETED", "MEETING", id);
    }

    // ===== READ =====

    @Override
    public MeetingResponse getById(Long id) {
        Meeting meeting = loadAndCheck(id);
        return toDto(meeting);
    }

    @Override
    public List<MeetingResponse> getByProject(Long projectId) {
        Long orgId = tenantAccessService.getCurrentOrganizationId();
        List<Meeting> meetings = tenantAccessService.isSuperAdmin()
                ? meetingRepository.findByProjectIdOrderByScheduledAtDesc(projectId)
                : meetingRepository.findByProjectIdAndProject_Organization_IdOrderByScheduledAtDesc(projectId, orgId);
        return meetings.stream().map(this::toDto).toList();
    }

    @Override
    public List<MeetingResponse> getMyUpcomingMeetings() {
        Long userId = tenantAccessService.getCurrentUserId();
        // Reunions ou je suis invite + celles que j'organise
        List<MeetingAttendee> invited = attendeeRepository.findByUserIdOrderByMeeting_ScheduledAtDesc(userId);
        List<Meeting> organized = meetingRepository.findByOrganizerIdOrderByScheduledAtDesc(userId);

        List<MeetingResponse> result = new ArrayList<>();
        for (MeetingAttendee a : invited) {
            result.add(toDto(a.getMeeting()));
        }
        for (Meeting m : organized) {
            if (result.stream().noneMatch(x -> x.getId().equals(m.getId()))) {
                result.add(toDto(m));
            }
        }
        // Trier : a venir d'abord (ASC), passees ensuite
        result.sort((a, b) -> a.getScheduledAt().compareTo(b.getScheduledAt()));
        return result;
    }

    // ===== ALL MY MEETINGS =====

    @Override
    public List<MeetingResponse> getAllMyMeetings() {
        Long userId = tenantAccessService.getCurrentUserId();
        List<MeetingAttendee> invited = attendeeRepository.findByUserIdOrderByMeeting_ScheduledAtDesc(userId);
        List<Meeting> organized = meetingRepository.findByOrganizerIdOrderByScheduledAtDesc(userId);

        List<MeetingResponse> result = new ArrayList<>();
        for (MeetingAttendee a : invited) {
            result.add(toDto(a.getMeeting()));
        }
        for (Meeting m : organized) {
            if (result.stream().noneMatch(x -> x.getId().equals(m.getId()))) {
                result.add(toDto(m));
            }
        }
        // Trier : les plus recentes en premier
        result.sort((a, b) -> b.getScheduledAt().compareTo(a.getScheduledAt()));
        return result;
    }

    // ===== JOIN =====

    @Override
    @Transactional
    public MeetingResponse joinMeeting(Long id) {
        Meeting meeting = loadAndCheck(id);

        Long currentUserId = tenantAccessService.getCurrentUserId();
        boolean isOrganizer = meeting.getOrganizer().getId().equals(currentUserId);
        boolean isAttendee = attendeeRepository.findByMeetingIdAndUserId(id, currentUserId).isPresent();

        if (!isOrganizer && !isAttendee && !tenantAccessService.canManageProjects()) {
            throw new ResponseStatusException(FORBIDDEN, "Acces refuse a cette reunion");
        }

        // Generer un roomName si la reunion n'en a pas (reunions creees avant la migration)
        boolean changed = false;
        if (meeting.getRoomName() == null || meeting.getRoomName().isBlank()) {
            meeting.setRoomName("gestionprojet-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
            changed = true;
        }

        if (meeting.getStatus() == MeetingStatus.SCHEDULED) {
            meeting.setStatus(MeetingStatus.IN_PROGRESS);
            changed = true;
        }

        if (changed) {
            meetingRepository.save(meeting);
        }

        return toDto(meeting);
    }

    // ===== STATUS / NOTES =====

    @Override
    @Transactional
    public MeetingResponse changeStatus(Long id, MeetingStatus status) {
        tenantAccessService.assertCanManageProjects();
        Meeting meeting = loadAndCheck(id);
        meeting.setStatus(status);
        return toDto(meetingRepository.save(meeting));
    }

    @Override
    @Transactional
    public MeetingResponse updateNotes(Long id, String notes) {
        Meeting meeting = loadAndCheck(id);
        // L'organizer ou un admin peut editer les notes
        boolean isOrganizer = meeting.getOrganizer().getId()
                .equals(tenantAccessService.getCurrentUserId());
        if (!isOrganizer && !tenantAccessService.canManageProjects()) {
            throw new ResponseStatusException(FORBIDDEN,
                    "Seul l'organisateur ou un admin peut editer les notes");
        }
        meeting.setNotes(notes);
        return toDto(meetingRepository.save(meeting));
    }

    @Override
    @Transactional
    public MeetingResponse respond(Long meetingId, AttendeeResponse response) {
        Long userId = tenantAccessService.getCurrentUserId();
        MeetingAttendee attendee = attendeeRepository.findByMeetingIdAndUserId(meetingId, userId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND,
                        "Vous n'etes pas invite a cette reunion"));

        attendee.setResponse(response);
        attendee.setRespondedAt(LocalDateTime.now());
        attendeeRepository.save(attendee);

        // Notifier l'organisateur
        Meeting m = attendee.getMeeting();
        User user = attendee.getUser();
        String userName = (user.getFirstName() + " " + user.getLastName()).trim();
        String verb = response == AttendeeResponse.ACCEPTED ? "a accepte" : "a decline";
        notify(m.getOrganizer(), userName + " " + verb + " votre invitation : " + m.getTitle());

        return toDto(m);
    }

    // ===== Helpers =====

    private void addAttendee(Meeting meeting, Long userId) {
        if (attendeeRepository.findByMeetingIdAndUserId(meeting.getId(), userId).isPresent()) {
            return;
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        // L'invite doit etre dans la meme organisation
        if (!user.getOrganization().getId()
                .equals(meeting.getProject().getOrganization().getId())) {
            return;
        }

        MeetingAttendee att = new MeetingAttendee();
        att.setMeeting(meeting);
        att.setUser(user);
        att.setResponse(AttendeeResponse.PENDING);
        att.setCreatedAt(LocalDateTime.now());
        attendeeRepository.save(att);

        notify(user, "Invitation a une reunion : " + meeting.getTitle()
                + " (" + meeting.getScheduledAt() + ")");
    }

    private void notify(User user, String message) {
        try {
            Notification n = new Notification();
            n.setUser(user);
            n.setMessage(message);
            n.setType(NotificationType.GENERAL);
            n.setCreatedAt(LocalDateTime.now());
            notificationService.createNotification(n);
        } catch (Exception ignored) {
            // ne pas planter la creation d'une reunion sur un echec de notif
        }
    }

    private Meeting loadAndCheck(Long id) {
        Meeting meeting = meetingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Reunion introuvable"));
        // Valider l'organisation via le projet s'il existe, sinon via l'organisateur
        if (meeting.getProject() != null) {
            tenantAccessService.validateSameOrganization(meeting.getProject());
        } else {
            tenantAccessService.validateSameOrganization(meeting.getOrganizer());
        }
        return meeting;
    }

    private void validateRequest(MeetingRequest req, boolean isCreate) {
        if (req == null) throw new ResponseStatusException(BAD_REQUEST, "Body manquant");
        if (isCreate) {
            if (req.getTitle() == null || req.getTitle().isBlank()) {
                throw new ResponseStatusException(BAD_REQUEST, "title requis");
            }
            if (req.getScheduledAt() == null) {
                throw new ResponseStatusException(BAD_REQUEST, "scheduledAt requis");
            }
        }
    }

    private MeetingResponse toDto(Meeting m) {
        MeetingResponse dto = new MeetingResponse();
        dto.setId(m.getId());
        if (m.getProject() != null) {
            dto.setProjectId(m.getProject().getId());
            dto.setProjectName(m.getProject().getName());
        }
        dto.setTitle(m.getTitle());
        dto.setDescription(m.getDescription());
        dto.setAgenda(m.getAgenda());
        dto.setNotes(m.getNotes());
        dto.setType(m.getType());
        dto.setModality(m.getModality());
        dto.setStatus(m.getStatus());
        dto.setScheduledAt(m.getScheduledAt());
        dto.setDurationMinutes(m.getDurationMinutes());
        dto.setOrganizerId(m.getOrganizer().getId());
        dto.setOrganizerName((safe(m.getOrganizer().getFirstName()) + " "
                + safe(m.getOrganizer().getLastName())).trim());
        dto.setCreatedAt(m.getCreatedAt());
        dto.setRoomName(m.getRoomName());

        List<MeetingResponse.AttendeeDto> attendees = new ArrayList<>();
        for (MeetingAttendee a : attendeeRepository.findByMeetingId(m.getId())) {
            MeetingResponse.AttendeeDto ad = new MeetingResponse.AttendeeDto();
            ad.setUserId(a.getUser().getId());
            ad.setName((safe(a.getUser().getFirstName()) + " "
                    + safe(a.getUser().getLastName())).trim());
            ad.setEmail(a.getUser().getEmail());
            ad.setResponse(a.getResponse());
            ad.setRespondedAt(a.getRespondedAt());
            attendees.add(ad);
        }
        dto.setAttendees(attendees);
        return dto;
    }

    private String safe(String s) { return s == null ? "" : s; }
}
