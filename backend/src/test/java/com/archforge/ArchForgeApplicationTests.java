package com.archforge;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "archforge.auth.secret=test-secret-key-that-is-sufficiently-long-for-hmac256"
})
class ArchForgeApplicationTests {

    @Test
    void contextLoads() {
    }
}
