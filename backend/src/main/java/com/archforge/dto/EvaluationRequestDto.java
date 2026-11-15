package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public record EvaluationRequestDto(
        @JsonProperty("session_id") String sessionId,
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("graph") Map<String, Object> graph
) {
}
