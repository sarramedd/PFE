package com.example.gestionprojet.services.impl;
import com.example.gestionprojet.entities.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User saveUser(User user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
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

    public User updateUser(Long id, User updatedUser) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setCin(updatedUser.getCin());
            existingUser.setName(updatedUser.getFirstName() + " " + updatedUser.getLastName());
            existingUser.setEmail(updatedUser.getEmail());

            // Only encode password if it's not already encoded
            if (updatedUser.getPasswordHash() != null && !updatedUser.getPasswordHash().isEmpty() && !updatedUser.getPasswordHash().startsWith("$2a$")) {
                existingUser.setPasswordHash(passwordEncoder.encode(updatedUser.getPasswordHash()));
            }


            existingUser.setRole(updatedUser.getRole());
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID : " + id));
    }
}
