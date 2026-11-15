package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Map;

public record DraftUpsertRequestDto(
        @JsonProperty("graph_json") Map<String, Object> graphJson
) {
}
