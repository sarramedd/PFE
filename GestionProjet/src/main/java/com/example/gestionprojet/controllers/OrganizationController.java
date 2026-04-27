package com.example.gestionprojet.controllers;

import com.example.gestionprojet.JwtResponse;
import com.example.gestionprojet.JwtUtil;
import com.example.gestionprojet.dto.OrganizationBootstrapRequest;
import com.example.gestionprojet.dto.OrganizationDTO;
import com.example.gestionprojet.entities.Organization;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.services.interfaces.OrganizationService;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationService organizationService;
    private final JwtUtil jwtUtil;
    private final TenantAccessService tenantAccessService;

    public OrganizationController(OrganizationService organizationService, JwtUtil jwtUtil, TenantAccessService tenantAccessService) {
        this.organizationService = organizationService;
        this.jwtUtil = jwtUtil;
        this.tenantAccessService = tenantAccessService;
    }

    @GetMapping
    public ResponseEntity<List<OrganizationDTO>> getAll() {
        tenantAccessService.assertSuperAdmin();
        return ResponseEntity.ok(organizationService.getAllOrganizations());
    }

    @GetMapping("/me")
    public ResponseEntity<OrganizationDTO> getMine() {
        Long organizationId = tenantAccessService.getCurrentOrganizationId();
        return ResponseEntity.ok(organizationService.getOrganizationDtoById(organizationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getById(@PathVariable Long id) {
        tenantAccessService.assertSuperAdmin();
        return ResponseEntity.ok(organizationService.getOrganizationById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Organization> create(
            @RequestPart("name") String name,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ) {
        tenantAccessService.assertSuperAdmin();
        Organization organization = new Organization();
        organization.setName(name);
        organization.setDescription(description);
        return new ResponseEntity<>(organizationService.createOrganization(organization, logo), HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Organization> update(
            @PathVariable Long id,
            @RequestPart("name") String name,
            @RequestPart(value = "description", required = false) String description,
            @RequestPart(value = "logo", required = false) MultipartFile logo
    ) {
        tenantAccessService.assertSuperAdmin();
        Organization organization = new Organization();
        organization.setName(name);
        organization.setDescription(description);
        return ResponseEntity.ok(organizationService.updateOrganization(id, organization, logo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tenantAccessService.assertSuperAdmin();
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/bootstrap/available")
    public ResponseEntity<Boolean> bootstrapAvailable() {
        return ResponseEntity.ok(organizationService.canBootstrap());
    }

    @GetMapping("/bootstrap/super-admin/available")
    public ResponseEntity<Boolean> superAdminBootstrapAvailable() {
        return ResponseEntity.ok(organizationService.canBootstrapSuperAdmin());
    }

    @PostMapping("/bootstrap")
    public ResponseEntity<JwtResponse> bootstrap(@RequestBody OrganizationBootstrapRequest request) {
        User admin = organizationService.bootstrapOrganizationWithAdmin(request);
        String token = jwtUtil.generateToken(admin);
        JwtResponse response = new JwtResponse(
                token,
                admin.getRole().name(),
                admin.getId(),
                admin.getOrganization().getId()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/bootstrap/super-admin")
    public ResponseEntity<JwtResponse> bootstrapSuperAdmin(@RequestBody OrganizationBootstrapRequest request) {
        User superAdmin = organizationService.bootstrapSuperAdmin(request);
        String token = jwtUtil.generateToken(superAdmin);
        JwtResponse response = new JwtResponse(
                token,
                superAdmin.getRole().name(),
                superAdmin.getId(),
                superAdmin.getOrganization().getId()
        );
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
