package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record SkillProfileEntryDto(
        @JsonProperty("tag") String tag,
        @JsonProperty("score") int score
) {
}
