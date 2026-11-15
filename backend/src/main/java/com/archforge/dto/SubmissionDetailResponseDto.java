package com.archforge.dto;

import com.archforge.model.Submission;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;
import java.util.Map;

public record SubmissionDetailResponseDto(
        @JsonProperty("id") String id,
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("score") int score,
        @JsonProperty("rubric_score") Integer rubricScore,
        @JsonProperty("ai_score") Integer aiScore,
        @JsonProperty("rubric_feedback") List<String> rubricFeedback,
        @JsonProperty("bottlenecks") List<String> bottlenecks,
        @JsonProperty("suggestions") List<String> suggestions,
        @JsonProperty("submitted_at") Instant submittedAt,
        @JsonProperty("graph_json") Map<String, Object> graphJson
) {
    public static SubmissionDetailResponseDto fromEntity(Submission submission) {
        return new SubmissionDetailResponseDto(
                submission.getId(),
                submission.getProblemSlug(),
                submission.getScore(),
                submission.getRubricScore(),
                submission.getAiScore(),
                submission.getRubricFeedback(),
                submission.getBottlenecks(),
                submission.getSuggestions(),
                submission.getSubmittedAt(),
                submission.getGraphJson()
        );
    }
}
