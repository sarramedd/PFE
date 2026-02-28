package com.example.gestionprojet;

public class JwtResponse {
    private String token;

    // Constructor that accepts a token
    public JwtResponse(String token) {
        this.token = token;
    }

    // Getter for the token
    public String getToken() {
        return token;
    }

    // Setter for the token
    public void setToken(String token) {
        this.token = token;
    }
}
