package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record DashboardResponseDto(
        @JsonProperty("user") UserResponseDto user,
        @JsonProperty("stats") DashboardStatsDto stats,
        @JsonProperty("progress") List<ProgressResponseDto> progress,
        @JsonProperty("recent_submissions") List<SubmissionResponseDto> recentSubmissions,
        @JsonProperty("recommended") List<RecommendedProblemDto> recommended,
        @JsonProperty("skill_profile") List<SkillProfileEntryDto> skillProfile
) {
}
