package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.RoleType;
import com.example.gestionprojet.security.PermissionAction;
import com.example.gestionprojet.security.TenantAccessService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/permissions")
public class PermissionController {
    private final TenantAccessService tenantAccessService;

    public PermissionController(TenantAccessService tenantAccessService) {
        this.tenantAccessService = tenantAccessService;
    }

    @GetMapping("/me")
    public ResponseEntity<Map<PermissionAction, Boolean>> getMyPermissions() {
        return ResponseEntity.ok(tenantAccessService.getCurrentPermissionMap());
    }

    @GetMapping("/matrix")
    public ResponseEntity<Map<RoleType, Map<PermissionAction, Boolean>>> getPermissionMatrix() {
        return ResponseEntity.ok(tenantAccessService.getPermissionMatrix());
    }
}
