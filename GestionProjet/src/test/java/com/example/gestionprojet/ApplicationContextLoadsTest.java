package com.example.gestionprojet;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class ApplicationContextLoadsTest {

    @Test
    void contextLoads() {
        // Vérifie que le contexte Spring Boot démarre correctement
    }
}
