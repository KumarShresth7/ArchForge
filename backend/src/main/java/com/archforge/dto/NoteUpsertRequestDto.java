package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record NoteUpsertRequestDto(
        @JsonProperty("content") String content
) {
}
