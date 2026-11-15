package com.archforge.dto;

import com.archforge.model.Draft;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;
import java.util.Map;

public record DraftResponseDto(
        @JsonProperty("problem_slug") String problemSlug,
        @JsonProperty("graph_json") Map<String, Object> graphJson,
        @JsonProperty("updated_at") Instant updatedAt
) {
    public static DraftResponseDto fromEntity(Draft draft) {
        return new DraftResponseDto(
                draft.getProblemSlug(),
                draft.getGraphJson(),
                draft.getUpdatedAt()
        );
    }
}
