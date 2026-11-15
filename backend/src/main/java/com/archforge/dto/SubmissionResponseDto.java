package com.archforge.dto;

import com.archforge.model.Submission;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.List;

public record SubmissionResponseDto(
        @JsonProperty("id") String id,
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("score") int score,
        @JsonProperty("rubric_score") Integer rubricScore,
        @JsonProperty("ai_score") Integer aiScore,
        @JsonProperty("rubric_feedback") List<String> rubricFeedback,
        @JsonProperty("bottlenecks") List<String> bottlenecks,
        @JsonProperty("suggestions") List<String> suggestions,
        @JsonProperty("submitted_at") Instant submittedAt
) {
    public static SubmissionResponseDto fromEntity(Submission submission) {
        return new SubmissionResponseDto(
                submission.getId(),
                submission.getProblemSlug(),
                submission.getScore(),
                submission.getRubricScore(),
                submission.getAiScore(),
                submission.getRubricFeedback(),
                submission.getBottlenecks(),
                submission.getSuggestions(),
                submission.getSubmittedAt()
        );
    }
}
