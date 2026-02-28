package com.example.gestionprojet.controllers;

import com.example.gestionprojet.JwtResponse;
import com.example.gestionprojet.JwtUtil;
import com.example.gestionprojet.dto.UserDTO;
import com.example.gestionprojet.services.impl.UserService;
import lombok.Data;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                          UserService userService,
                          JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO user) {
        try {
            logger.info("Attempting to authenticate user with email: {}", user.getEmail());
            logger.debug("Password received: {}", user.getPassword()); // Log du mot de passe reçu

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserDetails userDetails = userService.loadUserByUsername(user.getEmail());
            String token = jwtUtil.generateToken(userDetails);

            com.example.gestionprojet.JwtResponse jwtResponse = new com.example.gestionprojet.JwtResponse(token);
            logger.info("Authentication successful for user: {}", user.getEmail());
            return ResponseEntity.ok(jwtResponse);
        } catch (BadCredentialsException e) {
            logger.error("Authentication failed for user: {}. Reason: Invalid email or password", user.getEmail());
            logger.error("Stack trace:", e); // Séparé pour éviter l'ambiguïté
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        } catch (Exception e) {
            logger.error("Authentication failed for user: {}. Reason: {}", user.getEmail(), e.getMessage());
            logger.error("Stack trace:", e); // Séparé pour éviter l'ambiguïté
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed.");
        }
    }

    @Data
    static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    static class JwtResponse {
        private  String token;
    }
}