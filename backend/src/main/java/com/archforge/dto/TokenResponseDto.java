package com.archforge.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record TokenResponseDto(
        @JsonProperty("access_token") String accessToken,
        @JsonProperty("token_type") String tokenType,
        @JsonProperty("user") UserResponseDto user
) {
    public TokenResponseDto(String accessToken, UserResponseDto user) {
        this(accessToken, "bearer", user);
    }
}
