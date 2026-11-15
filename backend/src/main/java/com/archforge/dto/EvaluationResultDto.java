package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record EvaluationResultDto(
        @JsonProperty("status") String status,
        @JsonProperty("message") String message,
        @JsonProperty("score") Integer score,
        @JsonProperty("rubric_score") Integer rubricScore,
        @JsonProperty("ai_score") Integer aiScore,
        @JsonProperty("rubric_feedback") List<String> rubricFeedback,
        @JsonProperty("must_have_met") List<String> mustHaveMet,
        @JsonProperty("must_have_missing") List<String> mustHaveMissing,
        @JsonProperty("should_have_met") List<String> shouldHaveMet,
        @JsonProperty("reference_match_pct") Integer referenceMatchPct,
        @JsonProperty("bottlenecks") List<String> bottlenecks,
        @JsonProperty("suggestions") List<String> suggestions,
        @JsonProperty("problem_slug") String problemSlug
) {
    public static EvaluationResultDto processing(String message, int rubricScore) {
        return new EvaluationResultDto(
                "processing",
                message,
                null,
                rubricScore,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }

    public static EvaluationResultDto failed(String message) {
        return new EvaluationResultDto(
                "failed",
                message,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null
        );
    }
}
