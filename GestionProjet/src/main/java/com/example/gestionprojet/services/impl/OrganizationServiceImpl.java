package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.dto.OrganizationBootstrapRequest;
import com.example.gestionprojet.dto.OrganizationDTO;
import com.example.gestionprojet.entities.Organization;
import com.example.gestionprojet.entities.RoleType;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.OrganizationRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.services.interfaces.OrganizationService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrganizationServiceImpl implements OrganizationService {
    private static final String SYSTEM_ORGANIZATION_NAME = "SYSTEM";
    private static final Path ORGANIZATION_LOGO_DIRECTORY = Paths.get("uploads", "organizations");
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public OrganizationServiceImpl(
            OrganizationRepository organizationRepository,
            UserRepository userRepository,
            UserService userService
    ) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Override
    public Organization createOrganization(Organization organization, MultipartFile logo) {
        organization.setName(ValidationUtils.requireTrimmedText(organization.getName(), "Organization name", 2, 80));
        organization.setDescription(ValidationUtils.optionalText(organization.getDescription(), "Organization description", 300));

        organizationRepository.findByName(organization.getName()).ifPresent(existing -> {
            throw ValidationUtils.badRequest("An organization with this name already exists.");
        });

        if (organization.getCreatedAt() == null) {
            organization.setCreatedAt(LocalDateTime.now());
        }
        String logoUrl = storeLogo(logo);
        if (logoUrl != null) {
            organization.setLogoUrl(logoUrl);
        }
        return organizationRepository.save(organization);
    }

    @Override
    public Organization updateOrganization(Long id, Organization organization, MultipartFile logo) {
        Organization existing = getOrganizationById(id);
        String name = ValidationUtils.requireTrimmedText(organization.getName(), "Organization name", 2, 80);
        String description = ValidationUtils.optionalText(organization.getDescription(), "Organization description", 300);

        organizationRepository.findByName(name)
                .filter(found -> !found.getId().equals(id))
                .ifPresent(found -> {
                    throw ValidationUtils.badRequest("An organization with this name already exists.");
                });

        existing.setName(name);
        existing.setDescription(description);
        String logoUrl = storeLogo(logo);
        if (logoUrl != null) {
            existing.setLogoUrl(logoUrl);
        }
        return organizationRepository.save(existing);
    }

    @Override
    public void deleteOrganization(Long id) {
        Organization organization = getOrganizationById(id);
        organizationRepository.delete(organization);
    }

    @Override
    public Organization getOrganizationById(Long id) {
        return organizationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found"));
    }

    @Override
    public OrganizationDTO getOrganizationDtoById(Long id) {
        return toDto(getOrganizationById(id));
    }

    @Override
    public List<OrganizationDTO> getAllOrganizations() {
        return organizationRepository.findAll().stream().map(this::toDto).toList();
    }

    @Override
    public User bootstrapOrganizationWithAdmin(OrganizationBootstrapRequest request) {
        if (!canBootstrap()) {
            throw new RuntimeException("Bootstrap is no longer available");
        }

        Organization organization = new Organization();
        organization.setName(ValidationUtils.requireTrimmedText(request.getOrganizationName(), "Organization name", 2, 80));
        organization.setDescription(ValidationUtils.optionalText(request.getOrganizationDescription(), "Organization description", 300));
        organization = createOrganization(organization, null);

        User admin = new User();
        admin.setFirstName(ValidationUtils.requireName(request.getAdminFirstName(), "First name"));
        admin.setLastName(ValidationUtils.requireName(request.getAdminLastName(), "Last name"));
        admin.setEmail(ValidationUtils.requireEmail(request.getAdminEmail()));
        admin.setCin(request.getAdminCin());
        admin.setPasswordHash(request.getAdminPassword());
        admin.setRole(RoleType.ADMIN);
        admin.setIsActive(true);

        return userService.saveUserInOrganization(admin, organization.getId());
    }

    @Override
    public User bootstrapSuperAdmin(OrganizationBootstrapRequest request) {
        if (!canBootstrapSuperAdmin()) {
            throw new RuntimeException("Super admin bootstrap is no longer available");
        }

        Organization systemOrganization = organizationRepository.findByName(SYSTEM_ORGANIZATION_NAME)
                .orElseGet(() -> {
                    Organization organization = new Organization();
                    organization.setName(SYSTEM_ORGANIZATION_NAME);
                    organization.setDescription("Technical organization for global administration");
                    organization.setCreatedAt(LocalDateTime.now());
                    return organizationRepository.save(organization);
                });

        User superAdmin = new User();
        superAdmin.setFirstName(ValidationUtils.requireName(request.getAdminFirstName(), "First name"));
        superAdmin.setLastName(ValidationUtils.requireName(request.getAdminLastName(), "Last name"));
        superAdmin.setEmail(ValidationUtils.requireEmail(request.getAdminEmail()));
        superAdmin.setCin(request.getAdminCin());
        superAdmin.setPasswordHash(request.getAdminPassword());
        superAdmin.setRole(RoleType.SUPER_ADMIN);
        superAdmin.setIsActive(true);

        return userService.saveUserInOrganization(superAdmin, systemOrganization.getId());
    }

    @Override
    public boolean canBootstrap() {
        return organizationRepository.count() == 0 && userRepository.count() == 0;
    }

    @Override
    public boolean canBootstrapSuperAdmin() {
        return userRepository.findAll().stream().noneMatch(user -> user.getRole() == RoleType.SUPER_ADMIN);
    }

    private OrganizationDTO toDto(Organization organization) {
        OrganizationDTO dto = new OrganizationDTO();
        dto.setId(organization.getId());
        dto.setName(organization.getName());
        dto.setDescription(organization.getDescription());
        dto.setLogoUrl(organization.getLogoUrl());
        dto.setCreatedAt(organization.getCreatedAt());
        dto.setUserCount((long) userRepository.findByOrganizationId(organization.getId()).size());
        return dto;
    }

    private String storeLogo(MultipartFile logo) {
        if (logo == null || logo.isEmpty()) {
            return null;
        }

        try {
            Files.createDirectories(ORGANIZATION_LOGO_DIRECTORY);

            String originalName = logo.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf('.'));
            }

            String fileName = UUID.randomUUID() + extension;
            Path target = ORGANIZATION_LOGO_DIRECTORY.resolve(fileName);
            Files.copy(logo.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/organizations/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Unable to store organization logo", ex);
        }
    }
}
