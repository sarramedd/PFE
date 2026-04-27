package com.example.gestionprojet.controllers;

import com.example.gestionprojet.dto.UserDTO;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.impl.UserService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/users")

public class UserController {
@Autowired
    private UserService userService;
@Autowired
    private TenantAccessService tenantAccessService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> createUser(
            @ModelAttribute UserDTO dto,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        Long organizationId = tenantAccessService.isSuperAdmin() && dto.getOrganizationId() != null
                ? dto.getOrganizationId()
                : tenantAccessService.getCurrentOrganizationId();

        if (userService.getUserByEmailInOrganization(dto.getEmail(), organizationId).isPresent()) {
            throw ValidationUtils.badRequest("Email already exists in this organization.");
        }

        User user = new User();
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setCin(dto.getCin());
        user.setEmail(dto.getEmail());
        user.setIsActive(false);
        user.setPasswordHash(dto.getPassword());
        user.setRole(dto.getRole());

        User savedUser = userService.saveUserInOrganization(user, organizationId, avatar);

        //  Construire DTO de réponse
        UserDTO response = new UserDTO();
        response.setId(savedUser.getId());
        response.setFirstName(savedUser.getFirstName());
        response.setLastName(savedUser.getLastName());
        response.setEmail(savedUser.getEmail());
        response.setCin(savedUser.getCin());
        response.setIsActive(savedUser.getIsActive());
        response.setRole(savedUser.getRole());
        response.setAvatarUrl(savedUser.getAvatarUrl());
        response.setOrganizationId(savedUser.getOrganization().getId());
        response.setOrganizationName(savedUser.getOrganization().getName());
        response.setOrganizationLogoUrl(savedUser.getOrganization().getLogoUrl());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {

        User user = userService.getUserByEmail(email)
                .filter(foundUser -> foundUser.getOrganization().getId().equals(tenantAccessService.getCurrentOrganizationId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(convertToDTO(user));
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAll() {


        List<User> users = userService.getAllUsersInCurrentOrganization();

        List<UserDTO> dtos = users.stream().map(user -> {
            return convertToDTO(user);
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

    @PutMapping(path = "/{id}/profile", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDTO> updateProfile(
            @PathVariable Long id,
            @ModelAttribute UserDTO dto,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar
    ) {
        User updatedUser = userService.updateProfileFromDTO(id, dto, avatar);
        return ResponseEntity.ok(convertToDTO(updatedUser));
    }
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setCin(user.getCin());
        dto.setIsActive(user.getIsActive());
        dto.setRole(user.getRole());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setOrganizationId(user.getOrganization().getId());
        dto.setOrganizationName(user.getOrganization().getName());
        dto.setOrganizationLogoUrl(user.getOrganization().getLogoUrl());
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
