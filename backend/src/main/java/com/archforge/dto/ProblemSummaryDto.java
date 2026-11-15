package com.archforge.dto;

import com.archforge.model.Problem;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record ProblemSummaryDto(
        @JsonProperty("id") String id,
        @JsonProperty("slug") String slug,
        @JsonProperty("title") String title,
        @JsonProperty("difficulty") String difficulty,
        @JsonProperty("tags") List<String> tags
) {
    public static ProblemSummaryDto fromEntity(Problem problem) {
        return new ProblemSummaryDto(
                problem.getId(),
                problem.getSlug(),
                problem.getTitle(),
                problem.getDifficulty(),
                problem.getTags()
        );
    }
}
