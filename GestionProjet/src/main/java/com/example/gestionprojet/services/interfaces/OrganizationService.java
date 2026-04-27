package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.dto.OrganizationBootstrapRequest;
import com.example.gestionprojet.dto.OrganizationDTO;
import com.example.gestionprojet.entities.Organization;
import com.example.gestionprojet.entities.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface OrganizationService {
    Organization createOrganization(Organization organization, MultipartFile logo);
    Organization updateOrganization(Long id, Organization organization, MultipartFile logo);
    void deleteOrganization(Long id);
    Organization getOrganizationById(Long id);
    OrganizationDTO getOrganizationDtoById(Long id);
    List<OrganizationDTO> getAllOrganizations();
    User bootstrapOrganizationWithAdmin(OrganizationBootstrapRequest request);
    User bootstrapSuperAdmin(OrganizationBootstrapRequest request);
    boolean canBootstrap();
    boolean canBootstrapSuperAdmin();
}
