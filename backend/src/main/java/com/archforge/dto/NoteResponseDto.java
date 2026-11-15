package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record NoteResponseDto(
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("content") String content,
        @JsonProperty("updated_at") Instant updatedAt
) {
}
