package com.example.gestionprojet;

public class JwtResponse {
    private String token;
    private String role;
    private Long userId;
    private Long organizationId;

    public JwtResponse(String token, String role, Long userId, Long organizationId) {
        this.token = token;
        this.role = role;
        this.userId = userId;
        this.organizationId = organizationId;
    }
    public String getToken() {
        return token;
    }
    public void setToken(String token) {
        this.token = token;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
}
