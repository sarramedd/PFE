package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.dto.ProjectBriefResponse;
import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.repositories.CommentRepository;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.AiBriefService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

/**
 * Brief executif d'un projet via Gemini, avec fallback heuristique
 * si l'IA n'est pas configuree ou indisponible.
 */
@Service
public class AiBriefServiceImpl implements AiBriefService {

    private static final Logger log = LoggerFactory.getLogger(AiBriefServiceImpl.class);
    private static final int MAX_TASKS = 40;
    private static final int MAX_COMMENTS = 15;

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final CommentRepository commentRepository;
    private final TenantAccessService tenantAccessService;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiBriefServiceImpl(ProjectRepository projectRepository,
                              TaskRepository taskRepository,
                              CommentRepository commentRepository,
                              TenantAccessService tenantAccessService,
                              GeminiClient geminiClient) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.commentRepository = commentRepository;
        this.tenantAccessService = tenantAccessService;
        this.geminiClient = geminiClient;
    }

    @Override
    public ProjectBriefResponse generateProjectBrief(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Projet introuvable"));
        tenantAccessService.validateSameOrganization(project);

        List<Task> tasks = taskRepository.findByProjectId(projectId);
        List<Comment> comments = commentRepository.findByProjectIdOrderByCreatedAtAsc(projectId);

        ProjectBriefResponse response = new ProjectBriefResponse();
        response.setProjectId(project.getId());
        response.setProjectName(project.getName());
        response.setGeneratedAt(LocalDateTime.now());
        response.setProgressPercent(computeProgress(tasks));

        if (!geminiClient.isConfigured()) {
            log.warn("Gemini non configure, fallback heuristique.");
            return fillWithHeuristic(response, tasks);
        }

        try {
            String prompt = "Tu es un assistant chef de projet expert. " +
                    "Analyse ce projet et produis un brief en francais avec ces cles JSON : " +
                    "summary (1-2 phrases), progressPercent (0-100), " +
                    "riskLevel (LOW|MEDIUM|HIGH), risks (array), " +
                    "blockers (array), suggestions (array).\n\n" +
                    "Donnees :\n" + buildContextJson(project, tasks, comments);

            JsonNode ai = geminiClient.generateJson(prompt);
            response.setModel(geminiClient.getModel());
            response.setSummary(text(ai, "summary"));
            Integer aiProgress = intValue(ai, "progressPercent");
            if (aiProgress != null) {
                response.setProgressPercent(clamp(aiProgress));
            }
            response.setRiskLevel(text(ai, "riskLevel"));
            response.setRisks(stringList(ai, "risks"));
            response.setBlockers(stringList(ai, "blockers"));
            response.setSuggestions(stringList(ai, "suggestions"));
            return response;
        } catch (Exception ex) {
            log.error("Erreur Gemini, fallback heuristique.", ex);
            return fillWithHeuristic(response, tasks);
        }
    }

    private String buildContextJson(Project project, List<Task> tasks, List<Comment> comments) {
        ObjectNode root = objectMapper.createObjectNode();

        ObjectNode projectNode = root.putObject("project");
        projectNode.put("id", project.getId());
        projectNode.put("name", project.getName());
        projectNode.put("description", project.getDescription());
        projectNode.put("status", String.valueOf(project.getStatus()));
        projectNode.put("startDate", String.valueOf(project.getStartDate()));
        projectNode.put("endDate", String.valueOf(project.getEndDate()));

        ObjectNode stats = root.putObject("stats");
        long todo = tasks.stream().filter(t -> t.getStatus() == TaskStatus.TODO).count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        long overdue = tasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getStatus() != TaskStatus.DONE
                        && t.getDueDate().isBefore(LocalDate.now()))
                .count();
        stats.put("total", tasks.size());
        stats.put("todo", todo);
        stats.put("inProgress", inProgress);
        stats.put("done", done);
        stats.put("overdue", overdue);

        ArrayNode taskArray = root.putArray("tasks");
        tasks.stream()
                .sorted(Comparator.comparing(this::taskPriorityScore).reversed())
                .limit(MAX_TASKS)
                .forEach(t -> {
                    ObjectNode n = taskArray.addObject();
                    n.put("id", t.getId());
                    n.put("title", safe(t.getTitle()));
                    n.put("status", String.valueOf(t.getStatus()));
                    n.put("priority", String.valueOf(t.getPriority()));
                    n.put("dueDate", String.valueOf(t.getDueDate()));
                    n.put("assignedTo", t.getAssignedTo() != null
                            ? t.getAssignedTo().getEmail() : null);
                });

        ArrayNode commentArray = root.putArray("recentComments");
        comments.stream()
                .sorted(Comparator.comparing(Comment::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(MAX_COMMENTS)
                .forEach(c -> {
                    ObjectNode n = commentArray.addObject();
                    n.put("by", c.getAuthor() != null ? c.getAuthor().getEmail() : null);
                    n.put("at", String.valueOf(c.getCreatedAt()));
                    n.put("text", trim(c.getContent(), 300));
                });

        return root.toString();
    }

    private int taskPriorityScore(Task t) {
        int score = 0;
        if (t.getPriority() != null) {
            switch (t.getPriority()) {
                case HIGH: score += 100; break;
                case MEDIUM: score += 50; break;
                default: break;
            }
        }
        if (t.getDueDate() != null && t.getStatus() != TaskStatus.DONE
                && t.getDueDate().isBefore(LocalDate.now())) {
            score += 80;
        }
        return score;
    }

    private ProjectBriefResponse fillWithHeuristic(ProjectBriefResponse r, List<Task> tasks) {
        long overdue = tasks.stream()
                .filter(t -> t.getDueDate() != null
                        && t.getStatus() != TaskStatus.DONE
                        && t.getDueDate().isBefore(LocalDate.now()))
                .count();
        long inProgress = tasks.stream().filter(t -> t.getStatus() == TaskStatus.IN_PROGRESS).count();
        r.setModel("heuristic-fallback");
        r.setSummary("Resume genere localement (IA non configuree ou indisponible). " +
                tasks.size() + " taches au total dont " + inProgress + " en cours.");
        r.setRiskLevel(overdue > 3 ? "HIGH" : overdue > 0 ? "MEDIUM" : "LOW");
        r.setRisks(new ArrayList<>());
        r.setBlockers(new ArrayList<>());
        r.setSuggestions(new ArrayList<>());
        if (overdue > 0) r.getRisks().add(overdue + " tache(s) en retard");
        if (inProgress == 0 && !tasks.isEmpty()) {
            r.getBlockers().add("Aucune tache en cours : risque d'arret du projet");
        }
        r.getSuggestions().add("Configurer une cle API Gemini gratuite pour activer le brief intelligent");
        return r;
    }

    private int computeProgress(List<Task> tasks) {
        if (tasks.isEmpty()) return 0;
        long done = tasks.stream().filter(t -> t.getStatus() == TaskStatus.DONE).count();
        return (int) Math.round(100.0 * done / tasks.size());
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
