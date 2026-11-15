package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RecommendedProblemDto(
        @JsonProperty("slug") String slug,
        @JsonProperty("reason") String reason
) {
}
