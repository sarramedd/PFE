package com.example.gestionprojet.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionRegistry {
    private final Map<Long, Set<WebSocketSession>> notificationSessionsByUser = new ConcurrentHashMap<>();
    private final Map<Long, Set<WebSocketSession>> messageSessionsByProject = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void registerNotificationSession(Long userId, WebSocketSession session) {
        if (userId == null || session == null) {
            return;
        }
        notificationSessionsByUser
                .computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet())
                .add(session);
    }

    public void unregisterNotificationSession(Long userId, WebSocketSession session) {
        if (userId == null || session == null) {
            return;
        }
        Set<WebSocketSession> sessions = notificationSessionsByUser.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                notificationSessionsByUser.remove(userId);
            }
        }
    }

    public void registerProjectSession(Long projectId, WebSocketSession session) {
        if (projectId == null || session == null) {
            return;
        }
        messageSessionsByProject
                .computeIfAbsent(projectId, ignored -> ConcurrentHashMap.newKeySet())
                .add(session);
    }

    public void unregisterProjectSession(Long projectId, WebSocketSession session) {
        if (projectId == null || session == null) {
            return;
        }
        Set<WebSocketSession> sessions = messageSessionsByProject.get(projectId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                messageSessionsByProject.remove(projectId);
            }
        }
    }

    public void publishNotification(Long userId, Object payload) {
        publishToSessions(notificationSessionsByUser.get(userId), payload);
    }

    public void publishProjectMessage(Long projectId, Object payload) {
        publishToSessions(messageSessionsByProject.get(projectId), payload);
    }

    private void publishToSessions(Set<WebSocketSession> sessions, Object payload) {
        if (sessions == null || sessions.isEmpty() || payload == null) {
            return;
        }

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (Exception ex) {
            return;
        }

        TextMessage message = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            if (session == null || !session.isOpen()) {
                continue;
            }
            try {
                session.sendMessage(message);
            } catch (IOException ignored) {
            }
        }
    }
}

