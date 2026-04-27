package com.example.gestionprojet.controllers;

import com.example.gestionprojet.entities.AutomationRule;
import com.example.gestionprojet.services.impl.AutomationRuleServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automations")
public class AutomationController {
    private final AutomationRuleServiceImpl automationRuleService;

    public AutomationController(AutomationRuleServiceImpl automationRuleService) {
        this.automationRuleService = automationRuleService;
    }

    @PostMapping
    public ResponseEntity<AutomationRule> create(@RequestBody AutomationRule payload) {
        return new ResponseEntity<>(automationRuleService.create(payload), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AutomationRule>> getMine() {
        return ResponseEntity.ok(automationRuleService.getMine());
    }

    @PatchMapping("/{id}/enabled")
    public ResponseEntity<AutomationRule> toggle(@PathVariable Long id, @RequestParam boolean enabled) {
        return ResponseEntity.ok(automationRuleService.toggle(id, enabled));
    }
}
