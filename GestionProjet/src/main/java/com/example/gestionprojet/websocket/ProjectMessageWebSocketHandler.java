package com.example.gestionprojet.websocket;

import com.example.gestionprojet.JwtUserContext;
import com.example.gestionprojet.entities.Comment;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.UserDetailsImpl;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.impl.CommentServiceImpl;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class ProjectMessageWebSocketHandler extends TextWebSocketHandler {
    private final WebSocketSessionRegistry sessionRegistry;
    private final CommentServiceImpl commentService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ProjectMessageWebSocketHandler(WebSocketSessionRegistry sessionRegistry,
                                          CommentServiceImpl commentService,
                                          UserRepository userRepository) {
        this.sessionRegistry = sessionRegistry;
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Long projectId = getProjectId(session);
        if (projectId != null) {
            sessionRegistry.registerProjectSession(projectId, session);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long projectId = getProjectId(session);
        if (projectId != null) {
            sessionRegistry.unregisterProjectSession(projectId, session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        Long projectId = getProjectId(session);
        Long userId = getLongAttribute(session, "userId");
        Long organizationId = getLongAttribute(session, "organizationId");
        String email = asString(session.getAttributes().get("email"));

        if (projectId == null || userId == null || organizationId == null || email == null || email.isBlank()) {
            return;
        }

        String content = extractContent(message.getPayload());
        if (content == null || content.isBlank()) {
            return;
        }

        var user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return;
        }

        var userDetails = new UserDetailsImpl(user);
        var authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        authentication.setDetails(new JwtUserContext(userId, organizationId));

        try {
            SecurityContextHolder.getContext().setAuthentication(authentication);

            Comment comment = new Comment();
            comment.setContent(content);
            Project project = new Project();
            project.setId(projectId);
            comment.setProject(project);
            commentService.createComment(comment);
        } catch (Exception ignored) {
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private Long getProjectId(WebSocketSession session) {
        Object existing = session.getAttributes().get("projectId");
        if (existing instanceof Long longValue) {
            return longValue;
        }

        String path = session.getUri() != null ? session.getUri().getPath() : null;
        if (path == null) {
            return null;
        }

        int start = path.indexOf("/ws/projects/");
        int end = path.indexOf("/messages");
        if (start < 0 || end < 0 || end <= start) {
            return null;
        }

        String value = path.substring(start + "/ws/projects/".length(), end).trim();
        try {
            Long projectId = Long.parseLong(value);
            session.getAttributes().put("projectId", projectId);
            return projectId;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String extractContent(String payload) {
        if (payload == null || payload.isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(payload);
            JsonNode content = root.get("content");
            return content != null ? content.asText() : payload;
        } catch (Exception ex) {
            return payload;
        }
    }

    private Long getLongAttribute(WebSocketSession session, String key) {
        Object value = session.getAttributes().get(key);
        if (value instanceof Long longValue) {
            return longValue;
        }
        if (value instanceof Integer intValue) {
            return intValue.longValue();
        }
        return null;
    }

    private String asString(Object value) {
        return value instanceof String str ? str : null;
    }
}
