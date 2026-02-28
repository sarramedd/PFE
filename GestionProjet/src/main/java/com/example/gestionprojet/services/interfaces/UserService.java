package com.example.gestionprojet.services.interfaces;

import com.example.gestionprojet.entities.User;

import java.util.List;

public interface UserService {
    User createUser(User user);

    User updateUser(Long id, User user);

    void deleteUser(Long id);

    User getUserById(Long id);

    List<User> getAllUsers();

    User deactivateUser(Long id);

    User activateUser(Long id);

    User getByEmail(String email);
}
