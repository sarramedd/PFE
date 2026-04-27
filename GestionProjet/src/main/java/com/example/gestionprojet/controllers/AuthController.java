package com.example.gestionprojet.controllers;

import com.example.gestionprojet.JwtResponse;
import com.example.gestionprojet.JwtUtil;
import com.example.gestionprojet.dto.UserDTO;
import com.example.gestionprojet.services.impl.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:4200")
public class AuthController {
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;
    private final Map<String, ResetCodeEntry> resetCodes = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.mail.from:sarramadeh@gmail.com}")
    private String mailFrom;

    @Value("${app.security.reset-code-expiration-minutes:10}")
    private long resetCodeExpirationMinutes;

    public AuthController(AuthenticationManager authenticationManager,
                          UserService userService,
                          JwtUtil jwtUtil,
                          JavaMailSender mailSender) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.mailSender = mailSender;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO user) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            var authenticatedUser = userService.getUserByEmail(user.getEmail())
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
            String token = jwtUtil.generateToken(authenticatedUser);

            JwtResponse jwtResponse = new JwtResponse(
                    token,
                    authenticatedUser.getRole().name(),
                    authenticatedUser.getId(),
                    authenticatedUser.getOrganization().getId()
            );

            return ResponseEntity.ok(jwtResponse);
        } catch (BadCredentialsException e) {
            logger.error("Authentication failed for user: {}", user.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");
        } catch (Exception e) {
            logger.error("Authentication error for user {}: {}", user.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication failed.");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        if (request == null || request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email requis."));
        }

        String email = request.getEmail().trim().toLowerCase();
        var userOpt = userService.getUserByEmail(email);

        if (userOpt.isEmpty()) {
            // Do not leak account existence
            return ResponseEntity.ok(Map.of("message", "Si le compte existe, un code de verification a ete envoye."));
        }

        String code = generateVerificationCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(resetCodeExpirationMinutes);
        resetCodes.put(email, new ResetCodeEntry(code, expiresAt, false));

        try {
            sendResetCodeEmail(email, code);
            return ResponseEntity.ok(Map.of("message", "Code de verification envoye par email."));
        } catch (Exception e) {
            logger.error("Unable to send reset code email to {}: {}", email, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Impossible d'envoyer l'email de verification."));
        }
    }

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody VerifyResetCodeRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getCode())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email et code requis."));
        }

        String email = request.getEmail().trim().toLowerCase();
        ResetCodeEntry entry = resetCodes.get(email);

        if (entry == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Code invalide."));
        }

        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            resetCodes.remove(email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Code expire."));
        }

        if (!entry.code().equals(request.getCode().trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Code invalide."));
        }

        resetCodes.put(email, new ResetCodeEntry(entry.code(), entry.expiresAt(), true));
        return ResponseEntity.ok(Map.of("message", "Code valide."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request == null || isBlank(request.getEmail()) || isBlank(request.getCode()) || isBlank(request.getNewPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email, code et nouveau mot de passe requis."));
        }

        if (request.getNewPassword().trim().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mot de passe: minimum 8 caracteres."));
        }

        String email = request.getEmail().trim().toLowerCase();
        ResetCodeEntry entry = resetCodes.get(email);

        if (entry == null || !entry.code().equals(request.getCode().trim())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Code invalide."));
        }

        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            resetCodes.remove(email);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Code expire."));
        }

        if (!entry.verified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Veuillez verifier le code avant de changer le mot de passe."));
        }

        userService.resetPasswordByEmail(email, request.getNewPassword().trim());
        resetCodes.remove(email);

        return ResponseEntity.ok(Map.of("message", "Mot de passe reinitialise avec succes."));
    }

    private void sendResetCodeEmail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(mailFrom);
        message.setTo(toEmail);
        message.setSubject("TeamFlow - Code de verification");
        message.setText(
                "Bonjour,\n\n" +
                        "Votre code de verification TeamFlow est : " + code + "\n" +
                        "Ce code expire dans " + resetCodeExpirationMinutes + " minutes.\n\n" +
                        "Si vous n'avez pas demande de reinitialisation, ignorez cet email.\n\n" +
                        "TeamFlow"
        );
        mailSender.send(message);
    }

    private String generateVerificationCode() {
        int code = 100000 + secureRandom.nextInt(900000);
        return String.valueOf(code);
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private record ResetCodeEntry(String code, LocalDateTime expiresAt, boolean verified) {
    }

    public static class ForgotPasswordRequest {
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class VerifyResetCodeRequest {
        private String email;
        private String code;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }
    }

    public static class ResetPasswordRequest {
        private String email;
        private String code;
        private String newPassword;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }
}
