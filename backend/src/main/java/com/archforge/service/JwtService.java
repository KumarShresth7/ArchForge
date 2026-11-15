package com.archforge.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationHours;

    public JwtService(
            @Value("${archforge.auth.secret}") String secret,
            @Value("${archforge.auth.expiration-hours:2}") long expirationHours
    ) {
        this.expirationHours = expirationHours;
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            try {
                // Ensure 256 bits key for HS256 even if dev secret is shorter than 32 chars
                MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
                keyBytes = sha256.digest(keyBytes);
            } catch (NoSuchAlgorithmException e) {
                byte[] padded = new byte[32];
                System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
                keyBytes = padded;
            }
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String createToken(String userId, String email) {
        long nowMillis = System.currentTimeMillis();
        long expMillis = nowMillis + (expirationHours * 3600 * 1000);

        return Jwts.builder()
                .subject(userId)
                .claim("email", email)
                .issuedAt(new Date(nowMillis))
                .expiration(new Date(expMillis))
                .signWith(signingKey)
                .compact();
    }

    public Claims decodeToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid or expired token", e);
        }
    }
}
