package com.archforge.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionManager {

    private static final Logger log = LoggerFactory.getLogger(WebSocketSessionManager.class);

    private final Map<String, WebSocketSession> activeConnections = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    public WebSocketSessionManager(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void connect(String sessionId, WebSocketSession session) {
        activeConnections.put(sessionId, session);
        log.info("WebSocket connected for session: {}", sessionId);
    }

    public void disconnect(String sessionId) {
        activeConnections.remove(sessionId);
        log.info("WebSocket disconnected for session: {}", sessionId);
    }

    public void sendJsonPayload(String sessionId, Object payload) {
        WebSocketSession session = activeConnections.get(sessionId);
        if (session != null && session.isOpen()) {
            try {
                String json = objectMapper.writeValueAsString(payload);
                synchronized (session) {
                    if (session.isOpen()) {
                        session.sendMessage(new TextMessage(json));
                    }
                }
            } catch (IOException e) {
                log.error("Failed to send WebSocket message to session {}: {}", sessionId, e.getMessage());
            }
        } else {
            log.warn("Session {} not active or already closed when attempting to send message", sessionId);
        }
    }
}
