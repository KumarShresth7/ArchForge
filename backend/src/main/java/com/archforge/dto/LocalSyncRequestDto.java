package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public record LocalSyncRequestDto(
        @JsonProperty("progress") Map<String, Map<String, Object>> progress,
        @JsonProperty("drafts") Map<String, Map<String, Object>> drafts
) {
}
