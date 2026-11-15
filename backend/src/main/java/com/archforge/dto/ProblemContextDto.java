package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ProblemContextDto(
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("hints_unlocked") boolean hintsUnlocked,
        @JsonProperty("attempt_count") int attemptCount,
        @JsonProperty("best_score") Double bestScore,
        @JsonProperty("status") String status,
        @JsonProperty("similar_slugs") List<String> similarSlugs
) {
}
