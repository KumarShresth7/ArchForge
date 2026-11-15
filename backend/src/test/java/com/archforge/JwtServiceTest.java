package com.archforge;

import com.archforge.service.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService("test-secret-key-that-is-sufficiently-long-for-hmac256", 2);

    @Test
    void testTokenGenerationAndVerification() {
        String userId = "user-12345";
        String email = "architect@archforge.dev";

        String token = jwtService.createToken(userId, email);
        assertNotNull(token);
        assertFalse(token.isBlank());

        Claims claims = jwtService.decodeToken(token);
        assertEquals(userId, claims.getSubject());
        assertEquals(email, claims.get("email", String.class));
        assertNotNull(claims.getExpiration());
    }

    @Test
    void testShortSecretHandledGracefully() {
        // Dev secret < 32 chars
        JwtService shortKeyService = new JwtService("short-secret", 2);
        String token = shortKeyService.createToken("user-1", "user@test.com");
        Claims claims = shortKeyService.decodeToken(token);
        assertEquals("user-1", claims.getSubject());
    }

    @Test
    void testInvalidTokenThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> jwtService.decodeToken("invalid.token.payload"));
    }
}
