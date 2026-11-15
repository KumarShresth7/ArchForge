package com.archforge.dto;

import com.archforge.model.User;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public record UserResponseDto(
        @JsonProperty("id") String id,
        @JsonProperty("email") String email,
        @JsonProperty("name") String name,
        @JsonProperty("image") String image,
        @JsonProperty("created_at") Instant createdAt
) {
    public static UserResponseDto fromEntity(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getImage(),
                user.getCreatedAt()
        );
    }
}
