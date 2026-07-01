package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.dto.AssigneeSuggestionRequest;
import com.example.gestionprojet.dto.AssigneeSuggestionResponse;
import com.example.gestionprojet.dto.DiscussionSummaryResponse;
import com.example.gestionprojet.dto.RiskTasksResponse;
import com.example.gestionprojet.dto.TaskDescriptionRequest;
import com.example.gestionprojet.dto.TaskDescriptionResponse;
import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.ProjectMember;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.CommentRepository;
import com.example.gestionprojet.repositories.ProjectMemberRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.AiAssistantService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE;

@Service
public class AiAssistantServiceImpl implements AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantServiceImpl.class);
    private static final int MAX_COMMENTS = 60;
    private static final int MAX_TASKS = 60;

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TenantAccessService tenantAccessService;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiAssistantServiceImpl(ProjectRepository projectRepository,
                                  TaskRepository taskRepository,
                                  CommentRepository commentRepository,
                                  ProjectMemberRepository projectMemberRepository,
                                  TenantAccessService tenantAccessService,
                                  GeminiClient geminiClient) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.tenantAccessService = tenantAccessService;
        this.geminiClient = geminiClient;
    }

    // =========================================================================
    // 1) Generation de description de tache
    // =========================================================================

    @Override
    public TaskDescriptionResponse describeTask(TaskDescriptionRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(BAD_REQUEST, "Le titre est requis.");
        }
        requireAi();

        String language = request.getLanguage() != null ? request.getLanguage() : "fr";
        String projectContext = "";
        if (request.getProjectId() != null) {
            Project p = projectRepository.findById(request.getProjectId()).orElse(null);
            if (p != null) {
                tenantAccessService.validateSameOrganization(p);
                projectContext = "Contexte projet : " + safe(p.getName())
                        + " - " + safe(p.getDescription()) + "\n\n";
            }
        }

        String prompt = "Tu es un assistant de chef de projet. " +
                "A partir du titre court suivant, produis une description de tache professionnelle " +
                "et des criteres d'acceptation, ainsi qu'une estimation. " +
                "Reponds UNIQUEMENT en JSON avec ces cles : " +
                "description (string, 3 a 5 phrases en " + (language.equals("en") ? "anglais" : "francais") + "), " +
                "acceptanceCriteria (array de 3 a 5 strings courts), " +
                "estimatedHours (entier 1 a 80), " +
                "suggestedPriority (LOW|MEDIUM|HIGH).\n\n" +
                projectContext +
                "Titre : " + request.getTitle();

        try {
            JsonNode ai = geminiClient.generateJson(prompt);
            TaskDescriptionResponse r = new TaskDescriptionResponse();
            r.setDescription(text(ai, "description"));
            r.setAcceptanceCriteria(stringList(ai, "acceptanceCriteria"));
            r.setEstimatedHours(intValue(ai, "estimatedHours"));
            r.setSuggestedPriority(text(ai, "suggestedPriority"));
            r.setModel(geminiClient.getModel());
            return r;
        } catch (Exception ex) {
            log.error("Erreur describeTask", ex);
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "L'IA est temporairement indisponible.");
        }
    }

    // =========================================================================
    // 2) Suggestion d'assignation
    // =========================================================================

    @Override
    public AssigneeSuggestionResponse suggestAssignee(AssigneeSuggestionRequest request) {
        if (request == null || request.getProjectId() == null || request.getTitle() == null) {
            throw new ResponseStatusException(BAD_REQUEST, "projectId et title sont requis.");
        }
        requireAi();

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Projet introuvable"));
        tenantAccessService.validateSameOrganization(project);

        List<ProjectMember> members = projectMemberRepository.findAll().stream()
                .filter(pm -> pm.getProject() != null
                        && pm.getProject().getId().equals(project.getId()))
                .collect(Collectors.toList());

        // Calcul charge actuelle par user (taches non DONE)
        Map<Long, Long> activeTaskCountByUser = taskRepository.findByProjectId(project.getId()).stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE && t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(t -> t.getAssignedTo().getId(), Collectors.counting()));

        // Contexte JSON
        ObjectNode root = objectMapper.createObjectNode();
        root.put("taskTitle", request.getTitle());
        root.put("taskDescription", safe(request.getDescription()));
        ArrayNode candidates = root.putArray("candidates");
        for (ProjectMember pm : members) {
            User u = pm.getUser();
            if (u == null) continue;
            ObjectNode n = candidates.addObject();
            n.put("userId", u.getId());
            n.put("name", safe(u.getFirstName()) + " " + safe(u.getLastName()));
            n.put("email", u.getEmail());
            n.put("roleInProject", String.valueOf(pm.getRoleInProject()));
            n.put("activeTasks", activeTaskCountByUser.getOrDefault(u.getId(), 0L));
        }

        String prompt = "Tu es un assistant chef de projet. " +
                "Voici une nouvelle tache et la liste des membres du projet avec leur charge actuelle. " +
                "Choisis les 1 a 3 meilleurs candidats pour s'occuper de cette tache. " +
                "Privilegie ceux qui ont peu de charge et un role pertinent. " +
                "Reponds UNIQUEMENT en JSON :\n" +
                "{ \"suggestions\": [ { \"userId\": <id>, \"score\": 0-100, \"reason\": \"...\" } ] }\n" +
                "Les userId DOIVENT venir de la liste fournie.\n\n" + root.toString();

        try {
            JsonNode ai = geminiClient.generateJson(prompt);
            AssigneeSuggestionResponse response = new AssigneeSuggestionResponse();
            response.setModel(geminiClient.getModel());

            JsonNode arr = ai.path("suggestions");
            if (arr.isArray()) {
                Map<Long, User> userById = members.stream()
                        .filter(pm -> pm.getUser() != null)
                        .collect(Collectors.toMap(pm -> pm.getUser().getId(), ProjectMember::getUser, (a, b) -> a));
                for (JsonNode s : arr) {
                    Long uid = s.path("userId").asLong();
                    User u = userById.get(uid);
                    if (u == null) continue;
                    AssigneeSuggestionResponse.Suggestion sg = new AssigneeSuggestionResponse.Suggestion();
                    sg.setUserId(uid);
                    sg.setName(safe(u.getFirstName()) + " " + safe(u.getLastName()));
                    sg.setEmail(u.getEmail());
                    sg.setScore(clamp(s.path("score").asInt(50)));
                    sg.setCurrentLoad(activeTaskCountByUser.getOrDefault(uid, 0L).intValue());
                    sg.setReason(s.path("reason").asText(""));
                    response.getSuggestions().add(sg);
                }
            }
            return response;
        } catch (Exception ex) {
            log.error("Erreur suggestAssignee", ex);
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "L'IA est temporairement indisponible.");
        }
    }

    // =========================================================================
    // 3) Detection des taches a risque
    // =========================================================================

    @Override
    public RiskTasksResponse detectRiskTasks(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Projet introuvable"));
        tenantAccessService.validateSameOrganization(project);

        List<Task> tasks = taskRepository.findByProjectId(projectId).stream()
                .filter(t -> t.getStatus() != TaskStatus.DONE)
                .sorted(Comparator.comparing(this::dueDateOrFar))
                .limit(MAX_TASKS)
                .collect(Collectors.toList());

        RiskTasksResponse response = new RiskTasksResponse();
        response.setProjectId(projectId);

        if (tasks.isEmpty()) {
            return response; // pas de tache active
        }

        if (!geminiClient.isConfigured()) {
            // Fallback : on signale juste les taches en retard
            tasks.stream()
                    .filter(t -> t.getDueDate() != null && t.getDueDate().isBefore(LocalDate.now()))
                    .forEach(t -> response.getAtRiskTasks().add(toRiskTask(t,
                            90, "HIGH",
                            "Date d'echeance depassee",
                            "Reprogrammer ou reassigner")));
            response.setModel("heuristic-fallback");
            return response;
        }

        ArrayNode taskArray = objectMapper.createArrayNode();
        for (Task t : tasks) {
            ObjectNode n = taskArray.addObject();
            n.put("id", t.getId());
            n.put("title", safe(t.getTitle()));
            n.put("status", String.valueOf(t.getStatus()));
            n.put("priority", String.valueOf(t.getPriority()));
            n.put("dueDate", String.valueOf(t.getDueDate()));
            n.put("estimatedHours", t.getEstimatedHours());
            n.put("assignedTo", t.getAssignedTo() != null ? t.getAssignedTo().getEmail() : null);
        }

        String prompt = "Tu es un chef de projet expert en gestion des risques. " +
                "Analyse cette liste de taches actives (non terminees). " +
                "Identifie celles qui sont a risque de glissement OU deja en retard. " +
                "Pour chacune, donne riskScore (0-100), riskLevel (LOW|MEDIUM|HIGH), " +
                "reason (1 phrase) et recommendation (1 phrase actionable). " +
                "Date du jour : " + LocalDate.now() + ".\n" +
                "Reponds UNIQUEMENT en JSON :\n" +
                "{ \"atRiskTasks\": [ { \"taskId\":..., \"riskScore\":..., \"riskLevel\":\"...\", " +
                "\"reason\":\"...\", \"recommendation\":\"...\" } ] }\n\n" +
                "Taches :\n" + taskArray.toString();

        try {
            JsonNode ai = geminiClient.generateJson(prompt);
            response.setModel(geminiClient.getModel());
            Map<Long, Task> byId = tasks.stream().collect(Collectors.toMap(Task::getId, t -> t, (a, b) -> a));
            JsonNode arr = ai.path("atRiskTasks");
            if (arr.isArray()) {
                for (JsonNode n : arr) {
                    Task t = byId.get(n.path("taskId").asLong());
                    if (t == null) continue;
                    response.getAtRiskTasks().add(toRiskTask(t,
                            clamp(n.path("riskScore").asInt(50)),
                            text(n, "riskLevel"),
                            text(n, "reason"),
                            text(n, "recommendation")));
                }
            }
            return response;
        } catch (Exception ex) {
            log.error("Erreur detectRiskTasks", ex);
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "L'IA est temporairement indisponible.");
        }
    }

    private RiskTasksResponse.RiskTask toRiskTask(Task t, int score, String level,
                                                  String reason, String recommendation) {
        RiskTasksResponse.RiskTask rt = new RiskTasksResponse.RiskTask();
        rt.setTaskId(t.getId());
        rt.setTitle(t.getTitle());
        rt.setStatus(String.valueOf(t.getStatus()));
        rt.setDueDate(String.valueOf(t.getDueDate()));
        rt.setAssignedTo(t.getAssignedTo() != null ? t.getAssignedTo().getEmail() : null);
        rt.setRiskScore(score);
        rt.setRiskLevel(level != null ? level : "MEDIUM");
        rt.setReason(reason);
        rt.setRecommendation(recommendation);
        return rt;
    }

    private LocalDate dueDateOrFar(Task t) {
        return t.getDueDate() != null ? t.getDueDate() : LocalDate.MAX;
    }

    // =========================================================================
    // 4) Recap de discussion
    // =========================================================================

    @Override
    public DiscussionSummaryResponse summarizeDiscussion(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Projet introuvable"));
        tenantAccessService.validateSameOrganization(project);

        List<Comment> comments = commentRepository.findByProjectIdOrderByCreatedAtAsc(projectId);

        DiscussionSummaryResponse response = new DiscussionSummaryResponse();
        response.setProjectId(projectId);
        response.setTotalComments(comments.size());

        if (comments.isEmpty()) {
            response.setSummary("Aucun commentaire pour ce projet.");
            return response;
        }
        requireAi();

        // On garde les MAX_COMMENTS plus recents pour rester dans le budget tokens
        List<Comment> recent = comments.stream()
                .sorted(Comparator.comparing(Comment::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_COMMENTS)
                .sorted(Comparator.comparing(Comment::getCreatedAt,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        ArrayNode arr = objectMapper.createArrayNode();
        for (Comment c : recent) {
            ObjectNode n = arr.addObject();
            n.put("by", c.getAuthor() != null ? c.getAuthor().getEmail() : "?");
            n.put("at", String.valueOf(c.getCreatedAt()));
            n.put("text", trim(c.getContent(), 500));
        }

        String prompt = "Tu es un assistant chef de projet. " +
                "Voici les derniers commentaires d'un projet en ordre chronologique. " +
                "Produis un resume en francais avec ces cles JSON : " +
                "summary (3 a 5 phrases), keyPoints (array), " +
                "decisions (array, decisions prises), " +
                "openQuestions (array, questions/sujets en suspens).\n\n" +
                "Projet : " + safe(project.getName()) + "\n" +
                "Commentaires (" + recent.size() + " sur " + comments.size() + ") :\n" + arr.toString();

        try {
            JsonNode ai = geminiClient.generateJson(prompt);
            response.setModel(geminiClient.getModel());
            response.setSummary(text(ai, "summary"));
            response.setKeyPoints(stringList(ai, "keyPoints"));
            response.setDecisions(stringList(ai, "decisions"));
            response.setOpenQuestions(stringList(ai, "openQuestions"));
            return response;
        } catch (Exception ex) {
            log.error("Erreur summarizeDiscussion", ex);
            throw new ResponseStatusException(SERVICE_UNAVAILABLE, "L'IA est temporairement indisponible.");
        }
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private void requireAi() {
        if (!geminiClient.isConfigured()) {
            throw new ResponseStatusException(SERVICE_UNAVAILABLE,
                    "Cle API Gemini non configuree (app.ai.api-key).");
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? null : v.asText();
    }

    private Integer intValue(JsonNode node, String field) {
        JsonNode v = node.get(field);
        return v == null || v.isNull() ? null : v.asInt();
    }

    private List<String> stringList(JsonNode node, String field) {
        List<String> result = new ArrayList<>();
        JsonNode arr = node.get(field);
        if (arr != null && arr.isArray()) arr.forEach(n -> result.add(n.asText()));
        return result;
    }

    private int clamp(int v) { return Math.max(0, Math.min(100, v)); }
    private String safe(String s) { return s == null ? "" : s; }
    private String trim(String s, int max) {
        if (s == null) return "";
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }
}
