package com.example.gestionprojet.entities;

/** Types de reunions predefinis (sert a suggerer un agenda type). */
public enum MeetingType {
    STANDUP,         // Daily standup
    RETRO,           // Retrospective
    SPRINT_PLANNING, // Planification de sprint
    REVIEW,          // Revue de projet / demo
    ONE_ON_ONE,      // Tete a tete manager / membre
    OTHER
}
