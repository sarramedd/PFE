package com.example.gestionprojet.validation;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.regex.Pattern;

public final class ValidationUtils {
    private static final Pattern NAME_PATTERN = Pattern.compile("^[\\p{L}][\\p{L}\\s'’-]{1,49}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    private static final Pattern CIN_PATTERN = Pattern.compile("^[01]\\d{7}$");

    private ValidationUtils() {
    }

    public static String requireTrimmedText(String value, String fieldName, int minLength, int maxLength) {
        String sanitized = value == null ? "" : value.trim();

        if (sanitized.length() < minLength) {
            throw badRequest(fieldName + " is required.");
        }

        if (sanitized.length() > maxLength) {
            throw badRequest(fieldName + " must not exceed " + maxLength + " characters.");
        }

        return sanitized;
    }

    public static String requireName(String value, String fieldName) {
        String sanitized = requireTrimmedText(value, fieldName, 2, 50);
        if (!NAME_PATTERN.matcher(sanitized).matches()) {
            throw badRequest(fieldName + " contains invalid characters.");
        }
        return sanitized;
    }

    public static String requireEmail(String value) {
        String sanitized = requireTrimmedText(value, "Email", 5, 120).toLowerCase();
        if (!EMAIL_PATTERN.matcher(sanitized).matches()) {
            throw badRequest("Email format is invalid.");
        }
        return sanitized;
    }

    public static String optionalText(String value, String fieldName, int maxLength) {
        String sanitized = value == null ? "" : value.trim();
        if (sanitized.length() > maxLength) {
            throw badRequest(fieldName + " must not exceed " + maxLength + " characters.");
        }
        return sanitized;
    }

    public static void requirePassword(String password, boolean required) {
        String sanitized = password == null ? "" : password.trim();

        if (!required && sanitized.isEmpty()) {
            return;
        }

        if (sanitized.length() < 8) {
            throw badRequest("Password must contain at least 8 characters.");
        }
    }

    public static String requireCin(Long cin) {
        if (cin == null) {
            throw badRequest("CIN is required.");
        }

        if (cin < 0 || cin > 19999999L) {
            throw badRequest("CIN must contain 8 digits and start with 0 or 1.");
        }

        String formatted = String.format("%08d", cin);
        if (!CIN_PATTERN.matcher(formatted).matches()) {
            throw badRequest("CIN must contain 8 digits and start with 0 or 1.");
        }

        return formatted;
    }

    public static void validateDateRange(LocalDate startDate, LocalDate endDate, String startLabel, String endLabel) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw badRequest(endLabel + " must be on or after " + startLabel + ".");
        }
    }

    public static void validateFutureOrToday(LocalDate date, String fieldName) {
        if (date != null && date.isBefore(LocalDate.now())) {
            throw badRequest(fieldName + " cannot be in the past.");
        }
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseStatusException forbidden(String message) {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, message);
    }
}
