package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UserSyncRequestDto(
        @JsonProperty("email") String email,
        @JsonProperty("name") String name,
        @JsonProperty("image") String image
) {
}
