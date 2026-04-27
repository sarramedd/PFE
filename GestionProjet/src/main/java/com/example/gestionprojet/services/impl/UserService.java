package com.example.gestionprojet.services.impl;
import com.example.gestionprojet.dto.UserDTO;
import com.example.gestionprojet.entities.Organization;
import com.example.gestionprojet.entities.RoleType;
import com.example.gestionprojet.entities.UserDetailsImpl;
import com.example.gestionprojet.repositories.OrganizationRepository;
import com.example.gestionprojet.security.TenantAccessService;
import com.example.gestionprojet.validation.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {
    private static final Path USER_AVATAR_DIRECTORY = Paths.get("uploads", "users");
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;
    private final TenantAccessService tenantAccessService;

    @Autowired
    public UserService(UserRepository userRepository,
                       OrganizationRepository organizationRepository,
                       TenantAccessService tenantAccessService) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.tenantAccessService = tenantAccessService;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User saveUser(User user) {
        validateUser(user, true);
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public User saveUserInOrganization(User user, Long organizationId) {
        return saveUserInOrganization(user, organizationId, null);
    }

    public User saveUserInOrganization(User user, Long organizationId, MultipartFile avatar) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        user.setOrganization(organization);
        String avatarUrl = storeAvatar(avatar);
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }
        return saveUser(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllUsersInCurrentOrganization() {
        if (tenantAccessService.isSuperAdmin()) {
            return userRepository.findAll();
        }
        return userRepository.findByOrganizationId(tenantAccessService.getCurrentOrganizationId());
    }

    @Override
    public UserDetails loadUserByUsername(String email)
            throws UsernameNotFoundException {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UsernameNotFoundException("User not found"));

        return new UserDetailsImpl(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public void resetPasswordByEmail(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public Optional<User> getUserByEmailInCurrentOrganization(String email) {
        return userRepository.findByEmailAndOrganizationId(email, tenantAccessService.getCurrentOrganizationId());
    }

    public Optional<User> getUserByEmailInOrganization(String email, Long organizationId) {
        return userRepository.findByEmailAndOrganizationId(email, organizationId);
    }

    public User getUserByIdInCurrentOrganization(Long id) {
        if (tenantAccessService.isSuperAdmin()) {
            return userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }

        return userRepository.findByIdAndOrganizationId(id, tenantAccessService.getCurrentOrganizationId())
                .orElseThrow(() -> new RuntimeException("User not found in your organization"));
    }

    public User updateUserFromDTO(Long id, UserDTO dto) {
        User user = getUserByIdInCurrentOrganization(id);

        user.setFirstName(ValidationUtils.requireName(dto.getFirstName(), "First name"));
        user.setLastName(ValidationUtils.requireName(dto.getLastName(), "Last name"));
        user.setEmail(ValidationUtils.requireEmail(dto.getEmail()));
        user.setCin(dto.getCin());
        ValidationUtils.requireCin(user.getCin());

        userRepository.findByEmailAndOrganizationId(user.getEmail(), user.getOrganization().getId())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw ValidationUtils.badRequest("Email already exists in this organization.");
                });

        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            ValidationUtils.requirePassword(dto.getPassword(), false);
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword().trim()));
        }

        return userRepository.save(user);
    }

    public User updateProfileFromDTO(Long id, UserDTO dto, MultipartFile avatar) {
        User user = getUserByIdInCurrentOrganization(id);

        user.setFirstName(ValidationUtils.requireName(dto.getFirstName(), "First name"));
        user.setLastName(ValidationUtils.requireName(dto.getLastName(), "Last name"));
        user.setEmail(ValidationUtils.requireEmail(dto.getEmail()));
        user.setCin(dto.getCin());
        ValidationUtils.requireCin(user.getCin());

        userRepository.findByEmailAndOrganizationId(user.getEmail(), user.getOrganization().getId())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw ValidationUtils.badRequest("Email already exists in this organization.");
                });

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            ValidationUtils.requirePassword(dto.getPassword(), false);
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword().trim()));
        }

        String avatarUrl = storeAvatar(avatar);
        if (avatarUrl != null) {
            user.setAvatarUrl(avatarUrl);
        }

        return userRepository.save(user);
    }
    public User setUserActiveStatus(Long id, boolean active) {
        User user = getUserByIdInCurrentOrganization(id);

        user.setIsActive(active);

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = getUserByIdInCurrentOrganization(id);
        userRepository.delete(user);
    }

    private String storeAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            return null;
        }

        try {
            Files.createDirectories(USER_AVATAR_DIRECTORY);

            String originalName = avatar.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf('.'));
            }

            String fileName = UUID.randomUUID() + extension;
            Path target = USER_AVATAR_DIRECTORY.resolve(fileName);
            Files.copy(avatar.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/users/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Unable to store user avatar", ex);
        }
    }

    private void validateUser(User user, boolean requirePassword) {
        user.setFirstName(ValidationUtils.requireName(user.getFirstName(), "First name"));
        user.setLastName(ValidationUtils.requireName(user.getLastName(), "Last name"));
        user.setEmail(ValidationUtils.requireEmail(user.getEmail()));
        ValidationUtils.requirePassword(user.getPasswordHash(), requirePassword);
        ValidationUtils.requireCin(user.getCin());

        if (user.getRole() == null) {
            throw ValidationUtils.badRequest("Role is required.");
        }

        if (user.getRole() == RoleType.SUPER_ADMIN && !tenantAccessService.isSuperAdmin()) {
            throw ValidationUtils.forbidden("Only the super admin can create another super admin.");
        }

        Long organizationId = user.getOrganization() != null ? user.getOrganization().getId() : null;
        if (organizationId != null && userRepository.findByEmailAndOrganizationId(user.getEmail(), organizationId).isPresent()) {
            throw ValidationUtils.badRequest("Email already exists in this organization.");
        }
    }
}
