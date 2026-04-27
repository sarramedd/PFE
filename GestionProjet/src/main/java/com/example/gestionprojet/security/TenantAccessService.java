package com.example.gestionprojet.security;

import com.example.gestionprojet.JwtUserContext;
import com.example.gestionprojet.entities.Organization;
import com.example.gestionprojet.entities.Project;
import com.example.gestionprojet.entities.RoleType;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;

@Service
public class TenantAccessService {
    private final UserRepository userRepository;

    public TenantAccessService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long getCurrentUserId() {
        JwtUserContext context = getJwtContext();
        if (context.userId() == null) {
            throw new RuntimeException("Authenticated user id is missing");
        }
        return context.userId();
    }

    public Long getCurrentOrganizationId() {
        JwtUserContext context = getJwtContext();
        if (context.organizationId() == null) {
            throw new RuntimeException("Authenticated organization id is missing");
        }
        return context.organizationId();
    }

    public User getCurrentUser() {
        Long userId = getCurrentUserId();
        Long organizationId = getCurrentOrganizationId();

        if (isSuperAdmin()) {
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Authenticated super admin not found"));
        }

        return userRepository.findByIdAndOrganizationId(userId, organizationId)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in organization"));
    }

    public boolean isSuperAdmin() {
        return getCurrentUserRole() == RoleType.SUPER_ADMIN;
    }

    public boolean isProjectManager() {
        return getCurrentUserRole() == RoleType.PROJECT_MANAGER;
    }

    public boolean isMember() {
        return getCurrentUserRole() == RoleType.MEMBER;
    }

    public boolean canManageProjects() {
        RoleType role = getCurrentUserRole();
        return role == RoleType.SUPER_ADMIN
                || role == RoleType.ADMIN
                || role == RoleType.ORGANIZATION_ADMIN
                || role == RoleType.PROJECT_MANAGER;
    }

    public void assertCanManageProjects() {
        if (!canManageProjects()) {
            throw new RuntimeException("Project management access required");
        }
    }

    public void assertSuperAdmin() {
        if (!isSuperAdmin()) {
            throw new RuntimeException("Super admin access required");
        }
    }

    public void validateSameOrganization(User user) {
        validateOrganization(user.getOrganization());
    }

    public void validateSameOrganization(Project project) {
        validateOrganization(project.getOrganization());
    }

    public boolean hasPermission(PermissionAction action) {
        RoleType role = getCurrentUserRole();
        return getPermissionsForRole(role).getOrDefault(action, false);
    }

    public void assertPermission(PermissionAction action, String errorMessage) {
        if (!hasPermission(action)) {
            throw ValidationUtils.forbidden(errorMessage);
        }
    }

    public Map<PermissionAction, Boolean> getCurrentPermissionMap() {
        return new EnumMap<>(getPermissionsForRole(getCurrentUserRole()));
    }

    public Map<RoleType, Map<PermissionAction, Boolean>> getPermissionMatrix() {
        Map<RoleType, Map<PermissionAction, Boolean>> matrix = new EnumMap<>(RoleType.class);
        for (RoleType role : RoleType.values()) {
            matrix.put(role, new EnumMap<>(getPermissionsForRole(role)));
        }
        return matrix;
    }

    private Map<PermissionAction, Boolean> getPermissionsForRole(RoleType role) {
        EnumMap<PermissionAction, Boolean> permissions = new EnumMap<>(PermissionAction.class);

        switch (role) {
            case SUPER_ADMIN, ADMIN, ORGANIZATION_ADMIN -> {
                permissions.put(PermissionAction.DELETE_PROJECT, true);
                permissions.put(PermissionAction.DELETE_TASK, true);
                permissions.put(PermissionAction.VIEW_REPORTING, true);
                permissions.put(PermissionAction.MANAGE_MEMBERS, true);
            }
            case PROJECT_MANAGER -> {
                permissions.put(PermissionAction.DELETE_PROJECT, false);
                permissions.put(PermissionAction.DELETE_TASK, true);
                permissions.put(PermissionAction.VIEW_REPORTING, true);
                permissions.put(PermissionAction.MANAGE_MEMBERS, true);
            }
            case MEMBER -> {
                permissions.put(PermissionAction.DELETE_PROJECT, false);
                permissions.put(PermissionAction.DELETE_TASK, false);
                permissions.put(PermissionAction.VIEW_REPORTING, false);
                permissions.put(PermissionAction.MANAGE_MEMBERS, false);
            }
        }

        return permissions;
    }

    private void validateOrganization(Organization organization) {
        if (organization == null || organization.getId() == null) {
            throw new RuntimeException("Organization is missing");
        }

        if (isSuperAdmin()) {
            return;
        }

        if (!organization.getId().equals(getCurrentOrganizationId())) {
            throw new RuntimeException("Cross-organization access is forbidden");
        }
    }

    public RoleType getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || authentication instanceof AnonymousAuthenticationToken
                || authentication.getAuthorities() == null
                || authentication.getAuthorities().isEmpty()) {
            throw new RuntimeException("No authenticated role found");
        }

        String authority = authentication.getAuthorities().iterator().next().getAuthority();
        if ("ROLE_ANONYMOUS".equals(authority)) {
            throw new RuntimeException("Authentication is required");
        }
        return RoleType.valueOf(authority.replace("ROLE_", ""));
    }

    private JwtUserContext getJwtContext() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication.getDetails() == null) {
            throw new RuntimeException("No authenticated tenant context found");
        }

        if (authentication.getDetails() instanceof JwtUserContext context) {
            return context;
        }

        throw new RuntimeException("Invalid authenticated tenant context");
    }
}
