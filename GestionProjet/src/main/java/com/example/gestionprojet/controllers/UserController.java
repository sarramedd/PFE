package com.example.gestionprojet.controllers;

import com.example.gestionprojet.dto.UserDTO;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.services.impl.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")

public class UserController {
@Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody UserDTO dto) {

        if (userService.getUserByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setCin(dto.getCin());
        user.setEmail(dto.getEmail());
        user.setIsActive(false);
        user.setPasswordHash(dto.getPassword());
        user.setRole(dto.getRole());

        User savedUser = userService.saveUser(user);

        //  Construire DTO de réponse
        UserDTO response = new UserDTO();
        response.setId(savedUser.getId());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setEmail(savedUser.getEmail());
        response.setCin(savedUser.getCin());
        response.setIsActive(savedUser.getIsActive());
        response.setRole(savedUser.getRole());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {

        User user = userService.getUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setCin(user.getCin());

        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {


        List<User> users = userService.getAllUsers();

        List<UserDTO> dtos = users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setId(user.getId());
            dto.setFirstName(user.getFirstName());
            dto.setLastName(user.getLastName());
            dto.setEmail(user.getEmail());
            dto.setCin(user.getCin());
            dto.setIsActive(user.getIsActive());
            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> update(@PathVariable Long id,
                                          @RequestBody UserDTO dto) {
        User updatedUser = userService.updateUserFromDTO(id, dto);
        UserDTO response = convertToDTO(updatedUser);
        return ResponseEntity.ok(response);
    }
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setCin(user.getCin());
        return dto;
    }
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<UserDTO> deactivate(@PathVariable Long id) {
        User user = userService.setUserActiveStatus(id, false);
        return ResponseEntity.ok(convertToDTO(user));
    }

    // --- ACTIVATE ---
    @PatchMapping("/{id}/activate")
    public ResponseEntity<UserDTO> activate(@PathVariable Long id) {
        User user = userService.setUserActiveStatus(id, true);
        return ResponseEntity.ok(convertToDTO(user));
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        userService.deleteUser(id);
//        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//    }

}
