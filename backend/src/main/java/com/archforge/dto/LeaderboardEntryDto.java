package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LeaderboardEntryDto(
        @JsonProperty("rank") int rank,
        @JsonProperty("name") String name,
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("best_score") Double bestScore,
        @JsonProperty("status") String status
) {
}
