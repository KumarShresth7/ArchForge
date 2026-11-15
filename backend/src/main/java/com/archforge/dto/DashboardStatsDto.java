package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record DashboardStatsDto(
        @JsonProperty("problems_attempted") int problemsAttempted,
        @JsonProperty("problems_solved") int problemsSolved,
        @JsonProperty("total_submissions") long totalSubmissions,
        @JsonProperty("average_score") Double averageScore,
        @JsonProperty("current_streak") int currentStreak,
        @JsonProperty("longest_streak") int longestStreak
) {
}
