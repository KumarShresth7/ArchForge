package com.archforge.dto;

import com.archforge.model.UserProblemProgress;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record ProgressResponseDto(
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("status") String status,
        @JsonProperty("best_score") Double bestScore,
        @JsonProperty("attempt_count") int attemptCount,
        @JsonProperty("last_attempt_at") Instant lastAttemptAt
) {
    public static ProgressResponseDto fromEntity(UserProblemProgress progress) {
        return new ProgressResponseDto(
                progress.getProblemSlug(),
                progress.getStatus(),
                progress.getBestScore(),
                progress.getAttemptCount(),
                progress.getLastAttemptAt()
        );
    }
}
