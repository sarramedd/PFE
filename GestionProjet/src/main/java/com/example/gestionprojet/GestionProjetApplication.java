package com.example.gestionprojet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GestionProjetApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestionProjetApplication.class, args);
    }

}
