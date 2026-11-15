package com.archforge.dto;

import com.archforge.model.Problem;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public record ProblemDetailDto(
        @JsonProperty("id") String id,
        @JsonProperty("slug") String slug,
        @JsonProperty("title") String title,
        @JsonProperty("difficulty") String difficulty,
        @JsonProperty("tags") List<String> tags,
        @JsonProperty("description") String description,
        @JsonProperty("functional_requirements") List<String> functionalRequirements,
        @JsonProperty("non_functional_requirements") List<String> nonFunctionalRequirements,
        @JsonProperty("hints") List<String> hints,
        @JsonProperty("starter_graph") Map<String, Object> starterGraph
) {
    public static ProblemDetailDto fromEntity(Problem problem) {
        return new ProblemDetailDto(
                problem.getId(),
                problem.getSlug(),
                problem.getTitle(),
                problem.getDifficulty(),
                problem.getTags(),
                problem.getDescription(),
                problem.getFunctionalRequirements(),
                problem.getNonFunctionalRequirements(),
                problem.getHints(),
                problem.getStarterGraph()
        );
    }
}
