package com.example.gestionprojet.repositories;

import com.example.gestionprojet.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndOrganizationId(String email, Long organizationId);
    Optional<User> findByIdAndOrganizationId(Long id, Long organizationId);
    List<User> findByOrganizationId(Long organizationId);

    boolean existsByEmail(String email);
    boolean existsByEmailAndOrganizationId(String email, Long organizationId);

    @Query("""
            SELECT u FROM User u
            WHERE u.organization.id = :organizationId
              AND (
                LOWER(u.firstName) LIKE LOWER(CONCAT('%', :term, '%'))
                OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :term, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :term, '%'))
              )
            """)
    List<User> searchInOrganization(Long organizationId, String term);
}
