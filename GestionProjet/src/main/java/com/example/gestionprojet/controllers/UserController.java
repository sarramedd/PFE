package com.example.gestionprojet.controllers;

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

    @PostMapping("/register")
    public ResponseEntity<?> registerUser( @RequestBody User user) {

        if (userService.getUserByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already in use.");
        }


        User savedUser = userService.saveUser(user);

        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/email/{email}")
    public User getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email).get();
    }

    @GetMapping
    public ResponseEntity<List<User>> getAll() {
        List<User> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Long id,
                                       @RequestBody User user) {
        User updated = userService.updateUser(id, user);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Long id) {
//        userService.deleteUser(id);
//        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
//    }
//
//    @PatchMapping("/{id}/deactivate")
//    public ResponseEntity<User> deactivate(@PathVariable Long id) {
//        User user = userService.deactivateUser(id);
//        return new ResponseEntity<>(user, HttpStatus.OK);
//    }
//
//    @PatchMapping("/{id}/activate")
//    public ResponseEntity<User> activate(@PathVariable Long id) {
//        User user = userService.activateUser(id);
//        return new ResponseEntity<>(user, HttpStatus.OK);
//    }
}
