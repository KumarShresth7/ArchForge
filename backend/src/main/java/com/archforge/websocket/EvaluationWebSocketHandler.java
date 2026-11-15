package com.archforge.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;

@Component
public class EvaluationWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(EvaluationWebSocketHandler.class);
    private final WebSocketSessionManager sessionManager;

    public EvaluationWebSocketHandler(WebSocketSessionManager sessionManager) {
        this.sessionManager = sessionManager;
    }

    private String extractSessionId(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;
        String path = uri.getPath();
        if (path == null) return null;

        String prefix = "/ws/";
        int idx = path.indexOf(prefix);
        if (idx != -1) {
            String remainder = path.substring(idx + prefix.length());
            int slashIdx = remainder.indexOf('/');
            return slashIdx != -1 ? remainder.substring(0, slashIdx) : remainder;
        }
        return null;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = extractSessionId(session);
        if (sessionId != null && !sessionId.isBlank()) {
            session.getAttributes().put("sessionId", sessionId);
            sessionManager.connect(sessionId, session);
        } else {
            log.warn("WebSocket connected without valid sessionId in URI: {}", session.getUri());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Client heartbeats or messages can be ignored just like FastAPI
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = (String) session.getAttributes().get("sessionId");
        if (sessionId != null) {
            sessionManager.disconnect(sessionId);
        }
    }
}
