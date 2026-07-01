import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from 'src/app/shared/pipes/translate.pipe';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { Project } from 'src/app/shared/models/project.model';
import {
  Meeting,
  MeetingModality,
  MeetingRequest,
  MeetingStatus,
  MeetingType,
  AttendeeResponse
} from 'src/app/shared/models/meeting.model';
import { User } from 'src/app/shared/models/user.model';

type FilterTab = 'ALL' | 'UPCOMING' | 'PAST';

@Component({
  selector: 'app-frontoffice-reunions',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
<div class="fr-shell">

  <!-- En-tête page -->
  <div class="fr-header">
    <div class="fr-header-left">
      <h2 class="fr-title">
        <i class="bx bx-video fr-title-icon"></i>
        {{ 'meetings.title' | tf }}
      </h2>
      <p class="fr-subtitle">{{ 'meetings.subtitle' | tf }}</p>
    </div>
    <button class="fr-btn-create" (click)="openForm()">
      <i class="bx bx-plus"></i> {{ 'meetings.new' | tf }}
    </button>
  </div>

  <!-- Onglets filtre -->
  <div class="fr-tabs">
    <button class="fr-tab" [class.active]="activeTab === 'ALL'" (click)="setTab('ALL')">
      {{ 'meetings.all' | tf }} <span class="fr-tab-count">{{ allMeetings.length }}</span>
    </button>
    <button class="fr-tab" [class.active]="activeTab === 'UPCOMING'" (click)="setTab('UPCOMING')">
      {{ 'meetings.upcoming' | tf }} <span class="fr-tab-count">{{ upcomingCount }}</span>
    </button>
    <button class="fr-tab" [class.active]="activeTab === 'PAST'" (click)="setTab('PAST')">
      {{ 'meetings.past' | tf }} <span class="fr-tab-count">{{ pastCount }}</span>
    </button>
  </div>

  <!-- État chargement -->
  <div class="fr-loading" *ngIf="loading">
    <div class="fr-spinner"></div>
    <span>{{ 'common.loading' | tf }}</span>
  </div>

  <!-- Liste vide -->
  <div class="fr-empty" *ngIf="!loading && filtered.length === 0">
    <i class="bx bx-calendar-x fr-empty-icon"></i>
    <p>Aucune réunion pour cette période.</p>
    <button class="fr-btn-create-sm" (click)="openForm()">
      <i class="bx bx-plus"></i> {{ 'meetings.new' | tf }}
    </button>
  </div>

  <!-- Cartes réunions -->
  <div class="fr-grid" *ngIf="!loading && filtered.length > 0">
    <div class="fr-card" *ngFor="let m of filtered" [attr.data-status]="m.status">

      <!-- Barre latérale colorée selon statut -->
      <div class="fr-card-bar"></div>

      <div class="fr-card-inner">
        <!-- Header carte -->
        <div class="fr-card-head">
          <div class="fr-card-badges">
            <span class="fr-badge-status" [attr.data-status]="m.status">
              {{ statusIcon(m.status) }} {{ statusLabel(m.status) }}
            </span>
            <span class="fr-badge-modality" [attr.data-modality]="m.modality || 'PRESENTIEL'">
              {{ modalityIcon(m.modality) }} {{ modalityLabel(m.modality) }}
            </span>
            <span class="fr-badge-type">{{ typeLabel(m.type) }}</span>
          </div>

          <!-- Menu actions organisateur (coin haut droit) -->
          <div class="fr-card-menu" *ngIf="canManage(m) && m.status !== 'CANCELLED' && m.status !== 'COMPLETED'">
            <button class="fr-menu-trigger" (click)="toggleMenu(m.id, $event)" title="Options">
              <i class="bx bx-dots-vertical-rounded"></i>
            </button>
            <div class="fr-menu-dropdown" *ngIf="openMenuId === m.id" (click)="$event.stopPropagation()">
              <button class="fr-menu-item fr-menu-done"
                      *ngIf="m.status === 'SCHEDULED' || m.status === 'IN_PROGRESS'"
                      (click)="changeStatus(m, 'COMPLETED'); closeMenu()">
                <i class="bx bx-check-circle"></i> Marquer terminée
              </button>
              <button class="fr-menu-item fr-menu-cancel"
                      (click)="askCancel(m); closeMenu()">
                <i class="bx bx-x-circle"></i> Annuler la réunion
              </button>
            </div>
          </div>
        </div>

        <!-- Titre -->
        <h3 class="fr-card-title">{{ m.title }}</h3>

        <!-- Méta infos -->
        <div class="fr-card-meta">
          <span class="fr-meta-chip">
            <i class="bx bx-calendar"></i> {{ formatDate(m.scheduledAt) }}
          </span>
          <span class="fr-meta-chip">
            <i class="bx bx-time"></i> {{ m.durationMinutes }} min
          </span>
          <span class="fr-meta-chip" *ngIf="m.projectName">
            <i class="bx bx-folder-open"></i> {{ m.projectName }}
          </span>
          <span class="fr-meta-chip fr-meta-organizer">
            <i class="bx bx-user-circle"></i> {{ m.organizerName }}
          </span>
        </div>

        <p class="fr-card-desc" *ngIf="m.description">{{ m.description }}</p>

        <!-- Invités -->
        <div class="fr-attendees" *ngIf="m.attendees?.length">
          <div class="fr-att-label">
            <i class="bx bx-group"></i>
            <span>{{ m.attendees!.length }} invité{{ m.attendees!.length > 1 ? 's' : '' }}</span>
          </div>
          <div class="fr-att-chips">
            <span class="fr-att-chip"
                  *ngFor="let a of (m.attendees | slice:0:5)"
                  [attr.data-resp]="a.response"
                  [title]="a.name + ' — ' + responseLabel(a.response)">
              {{ initials(a.name) }}
            </span>
            <span class="fr-att-more" *ngIf="m.attendees!.length > 5">+{{ m.attendees!.length - 5 }}</span>
          </div>
        </div>

        <!-- Actions membre -->
        <div class="fr-card-actions">
          <!-- Rejoindre en ligne -->
          <button class="fr-btn-join" *ngIf="canJoin(m)" (click)="joinOnline(m)">
            <i class="bx bx-video"></i> {{ 'meetings.join' | tf }}
          </button>

          <!-- Répondre invitation -->
          <ng-container *ngIf="myResponse(m) === 'PENDING' && !canManage(m)">
            <button class="fr-btn-accept" (click)="respond(m, 'ACCEPTED')">
              <i class="bx bx-check"></i> {{ 'meetings.accept' | tf }}
            </button>
            <button class="fr-btn-decline" (click)="respond(m, 'DECLINED')">
              <i class="bx bx-x"></i> {{ 'meetings.decline' | tf }}
            </button>
          </ng-container>

          <span class="fr-resp-badge fr-resp-accepted" *ngIf="myResponse(m) === 'ACCEPTED'">
            <i class="bx bx-check-circle"></i> Acceptée
          </span>
          <span class="fr-resp-badge fr-resp-declined" *ngIf="myResponse(m) === 'DECLINED'">
            <i class="bx bx-x-circle"></i> Déclinée
          </span>
          <span class="fr-resp-badge fr-resp-cancelled" *ngIf="m.status === 'CANCELLED'">
            <i class="bx bx-block"></i> Annulée
          </span>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== MODAL CONFIRMATION ANNULATION ===== -->
  <div class="fr-overlay" *ngIf="meetingToCancel" (click)="meetingToCancel = null">
    <div class="fr-confirm-modal" (click)="$event.stopPropagation()">
      <div class="fr-confirm-icon">
        <i class="bx bx-error-circle"></i>
      </div>
      <h3>Annuler cette réunion ?</h3>
      <p>
        <strong>{{ meetingToCancel.title }}</strong><br>
        <span>{{ formatDate(meetingToCancel.scheduledAt) }}</span>
      </p>
      <p class="fr-confirm-warn">
        Cette action est irréversible. Tous les participants seront informés.
      </p>
      <div class="fr-confirm-actions">
        <button class="fr-btn-ghost" (click)="meetingToCancel = null">Garder la réunion</button>
        <button class="fr-btn-cancel-confirm" (click)="confirmCancel()" [disabled]="cancelling">
          <span *ngIf="cancelling" class="fr-spinner-sm"></span>
          <i *ngIf="!cancelling" class="bx bx-x-circle"></i>
          {{ cancelling ? 'Annulation…' : 'Oui, annuler' }}
        </button>
      </div>
    </div>
  </div>

  <!-- ===== MODAL CRÉATION ===== -->
  <div class="fr-overlay" *ngIf="showForm" (click)="closeForm()">
    <div class="fr-modal" (click)="$event.stopPropagation()">
      <div class="fr-modal-head">
        <div>
          <h3>{{ 'meetings.new' | tf }}</h3>
          <p class="fr-modal-sub">Planifiez une nouvelle réunion d'équipe</p>
        </div>
        <button class="fr-close" (click)="closeForm()">×</button>
      </div>

      <form class="fr-form" (ngSubmit)="submit()" #f="ngForm">

        <!-- MODALITÉ -->
        <div class="fr-modality-group">
          <label class="fr-field-label">{{ 'meetings.modality' | tf }} *</label>
          <div class="fr-modality-cards">
            <label class="fr-mod-card" [class.selected]="draft.modality === 'PRESENTIEL'">
              <input type="radio" name="modality" [(ngModel)]="draft.modality" value="PRESENTIEL" required />
              <span class="fr-mod-icon">🏢</span>
              <span class="fr-mod-name">{{ 'meetings.presentiel' | tf }}</span>
              <span class="fr-mod-desc">Tous en salle</span>
            </label>
            <label class="fr-mod-card" [class.selected]="draft.modality === 'EN_LIGNE'">
              <input type="radio" name="modality" [(ngModel)]="draft.modality" value="EN_LIGNE" required />
              <span class="fr-mod-icon">💻</span>
              <span class="fr-mod-name">{{ 'meetings.online' | tf }}</span>
              <span class="fr-mod-desc">Visioconférence Jitsi</span>
            </label>
            <label class="fr-mod-card" [class.selected]="draft.modality === 'HYBRIDE'">
              <input type="radio" name="modality" [(ngModel)]="draft.modality" value="HYBRIDE" required />
              <span class="fr-mod-icon">🔀</span>
              <span class="fr-mod-name">{{ 'meetings.hybrid' | tf }}</span>
              <span class="fr-mod-desc">Présentiel + en ligne</span>
            </label>
          </div>
        </div>

        <!-- Titre -->
        <label class="fr-field-label">Titre *
          <input type="text" class="fr-input" [(ngModel)]="draft.title" name="title"
                 required minlength="3" maxlength="200" placeholder="Ex: Standup hebdo" />
        </label>

        <!-- Type + Durée -->
        <div class="fr-grid2">
          <label class="fr-field-label">Type
            <select class="fr-input" [(ngModel)]="draft.type" name="type">
              <option value="STANDUP">Daily standup</option>
              <option value="SPRINT_PLANNING">Sprint planning</option>
              <option value="RETRO">Rétrospective</option>
              <option value="REVIEW">Review / Démo</option>
              <option value="ONE_ON_ONE">1-on-1</option>
              <option value="OTHER">Autre</option>
            </select>
          </label>
          <label class="fr-field-label">Durée (min)
            <input type="number" class="fr-input" [(ngModel)]="draft.durationMinutes"
                   name="durationMinutes" min="5" max="480" />
          </label>
        </div>

        <!-- Date & heure -->
        <label class="fr-field-label">Date & heure *
          <input type="datetime-local" class="fr-input" [(ngModel)]="draft.scheduledAt"
                 name="scheduledAt" required />
        </label>

        <!-- Description -->
        <label class="fr-field-label">Description
          <textarea class="fr-input" rows="2" [(ngModel)]="draft.description"
                    name="description" maxlength="2000" placeholder="Contexte, objectifs…"></textarea>
        </label>

        <!-- Agenda -->
        <label class="fr-field-label">Agenda
          <textarea class="fr-input" rows="3" [(ngModel)]="draft.agenda"
                    name="agenda" maxlength="4000"
                    placeholder="- Point 1&#10;- Point 2&#10;- …"></textarea>
        </label>

        <!-- Projet (optionnel) -->
        <label class="fr-field-label">Projet lié
          <select class="fr-input" [(ngModel)]="draft.projectId" name="projectId">
            <option [ngValue]="null">Aucun projet</option>
            <option *ngFor="let p of projects" [ngValue]="p.id">{{ p.name }}</option>
          </select>
        </label>

        <!-- Invités -->
        <div class="fr-field-label">
          Invités
          <div class="fr-invite-search">
            <i class="bx bx-search fr-invite-search-icon"></i>
            <input type="text" class="fr-input fr-input-search" [(ngModel)]="inviteSearch"
                   name="inviteSearch" placeholder="Rechercher un membre…" />
          </div>
          <div class="fr-invite-list">
            <label *ngFor="let u of filteredOrgUsers" class="fr-invite-row">
              <input type="checkbox"
                     [checked]="selectedIds.has(u.id)"
                     (change)="toggleInvite(u.id, $event)" />
              <div class="fr-invite-avatar">{{ initials(u.firstName + ' ' + u.lastName) }}</div>
              <div class="fr-invite-info">
                <span class="fr-invite-name">{{ u.firstName }} {{ u.lastName }}</span>
                <span class="fr-invite-email">{{ u.email }}</span>
              </div>
              <i class="bx bx-check fr-invite-check" *ngIf="selectedIds.has(u.id)"></i>
            </label>
            <p class="fr-empty-invite" *ngIf="filteredOrgUsers.length === 0">
              Aucun membre trouvé.
            </p>
          </div>
          <p class="fr-selected-hint" *ngIf="selectedIds.size > 0">
            <i class="bx bx-check-circle"></i> {{ selectedIds.size }} invité(s) sélectionné(s)
          </p>
        </div>

        <p class="fr-form-error" *ngIf="formError">
          <i class="bx bx-error-circle"></i> {{ formError }}
        </p>

        <div class="fr-form-actions">
          <button type="button" class="fr-btn-ghost" (click)="closeForm()">{{ 'common.cancel' | tf }}</button>
          <button type="submit" class="fr-btn-create" [disabled]="submitting || !f.valid">
            <span *ngIf="submitting" class="fr-spinner-sm"></span>
            <i *ngIf="!submitting" class="bx bx-calendar-plus"></i>
            {{ submitting ? ('common.loading' | tf) : ('meetings.create' | tf) }}
          </button>
        </div>
      </form>
    </div>
  </div>

</div>
  `,
  styles: [`
    /* ======= Shell ======= */
    .fr-shell { padding: 0; font-family: 'Inter', sans-serif; background: transparent; }

    /* ======= Header ======= */
    .fr-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; gap: 16px; flex-wrap: wrap;
    }
    .fr-title {
      font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 3px;
      display: flex; align-items: center; gap: 10px;
    }
    .fr-title-icon { color: #6366f1; font-size: 22px; }
    .fr-subtitle { color: #64748b; font-size: 13px; margin: 0; }

    /* ======= Boutons ======= */
    .fr-btn-create {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; border: none; border-radius: 10px; font-size: 13px;
      font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 14px rgba(99,102,241,0.3); transition: opacity .15s;
    }
    .fr-btn-create:hover { opacity: .88; }
    .fr-btn-create:disabled { opacity: .45; cursor: not-allowed; }
    .fr-btn-create-sm {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; background: #6366f1; color: #fff; border: none;
      border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 14px;
    }
    .fr-btn-ghost {
      padding: 9px 18px; background: #fff; color: #374151;
      border: 1px solid #d1d5db; border-radius: 9px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background .13s;
    }
    .fr-btn-ghost:hover { background: #f9fafb; }

    /* ======= Tabs ======= */
    .fr-tabs {
      display: flex; gap: 4px; margin-bottom: 18px;
      border-bottom: 2px solid #e2e8f0;
    }
    .fr-tab {
      padding: 8px 16px; background: none; border: none; border-bottom: 2px solid transparent;
      margin-bottom: -2px; font-size: 13px; font-weight: 600; color: #64748b;
      cursor: pointer; border-radius: 6px 6px 0 0; transition: all .15s;
      display: flex; align-items: center; gap: 6px;
    }
    .fr-tab:hover { color: #6366f1; background: #f1f5f9; }
    .fr-tab.active { color: #6366f1; border-bottom-color: #6366f1; }
    .fr-tab-count {
      background: #e0e7ff; color: #4f46e5; font-size: 11px; font-weight: 700;
      padding: 1px 7px; border-radius: 999px;
    }
    .fr-tab.active .fr-tab-count { background: #6366f1; color: #fff; }

    /* ======= Loading / Empty ======= */
    .fr-loading {
      display: flex; align-items: center; gap: 12px; color: #64748b;
      padding: 56px; justify-content: center; font-size: 14px;
    }
    .fr-spinner {
      width: 26px; height: 26px; border: 3px solid #e2e8f0;
      border-top-color: #6366f1; border-radius: 50%;
      animation: spin .7s linear infinite; flex-shrink: 0;
    }
    .fr-spinner-sm {
      display: inline-block; width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,.35); border-top-color: #fff;
      border-radius: 50%; animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .fr-empty { text-align: center; padding: 64px 24px; color: #94a3b8; }
    .fr-empty-icon { font-size: 52px; display: block; margin-bottom: 14px; color: #cbd5e1; }

    /* ======= Grid ======= */
    .fr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 14px;
    }

    /* ======= Carte ======= */
    .fr-card {
      background: #fff; border-radius: 14px;
      border: 1px solid #e8eaed;
      box-shadow: 0 1px 4px rgba(0,0,0,.04);
      transition: box-shadow .18s, transform .18s;
      display: flex; overflow: hidden;
      position: relative;
    }
    .fr-card:hover { box-shadow: 0 6px 28px rgba(99,102,241,.1); transform: translateY(-2px); }
    .fr-card[data-status="CANCELLED"] { opacity: .62; }

    /* Barre latérale colorée */
    .fr-card-bar {
      width: 4px; flex-shrink: 0;
      background: #e2e8f0;
    }
    .fr-card[data-status="SCHEDULED"]  .fr-card-bar { background: #6366f1; }
    .fr-card[data-status="IN_PROGRESS"] .fr-card-bar { background: #f59e0b; }
    .fr-card[data-status="COMPLETED"]  .fr-card-bar { background: #10b981; }
    .fr-card[data-status="CANCELLED"]  .fr-card-bar { background: #ef4444; }

    .fr-card-inner { flex: 1; padding: 16px 16px 14px; display: flex; flex-direction: column; gap: 10px; min-width: 0; }

    /* Header carte */
    .fr-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
    .fr-card-badges { display: flex; flex-wrap: wrap; gap: 5px; flex: 1; min-width: 0; }
    .fr-badge-status, .fr-badge-modality, .fr-badge-type {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; white-space: nowrap;
    }
    .fr-badge-status[data-status="SCHEDULED"]  { background: #ede9fe; color: #5b21b6; }
    .fr-badge-status[data-status="IN_PROGRESS"]{ background: #fef3c7; color: #b45309; }
    .fr-badge-status[data-status="COMPLETED"]  { background: #d1fae5; color: #065f46; }
    .fr-badge-status[data-status="CANCELLED"]  { background: #fee2e2; color: #991b1b; }
    .fr-badge-modality[data-modality="PRESENTIEL"] { background: #dbeafe; color: #1d4ed8; }
    .fr-badge-modality[data-modality="EN_LIGNE"]   { background: #f3e8ff; color: #7c3aed; }
    .fr-badge-modality[data-modality="HYBRIDE"]    { background: #fef9c3; color: #854d0e; }
    .fr-badge-type { background: #f1f5f9; color: #475569; }

    /* Menu contextuel (⋮) */
    .fr-card-menu { position: relative; flex-shrink: 0; }
    .fr-menu-trigger {
      width: 28px; height: 28px; border-radius: 8px; background: none; border: none;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 18px; color: #94a3b8; transition: background .13s, color .13s;
    }
    .fr-menu-trigger:hover { background: #f1f5f9; color: #374151; }
    .fr-menu-dropdown {
      position: absolute; right: 0; top: calc(100% + 4px); z-index: 100;
      background: #fff; border: 1px solid #e2e8f0;
      border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.12);
      min-width: 188px; overflow: hidden;
      animation: fade-in .12s ease;
    }
    @keyframes fade-in { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform: none; } }
    .fr-menu-item {
      width: 100%; padding: 10px 14px; background: none; border: none;
      text-align: left; cursor: pointer; font-size: 13px; font-weight: 600;
      display: flex; align-items: center; gap: 8px; transition: background .1s;
      color: #374151;
    }
    .fr-menu-item:hover { background: #f8fafc; }
    .fr-menu-item i { font-size: 15px; }
    .fr-menu-done { color: #065f46; }
    .fr-menu-done:hover { background: #d1fae5; }
    .fr-menu-cancel { color: #991b1b; }
    .fr-menu-cancel:hover { background: #fee2e2; }

    /* Titre carte */
    .fr-card-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 0; line-height: 1.3; }

    /* Méta */
    .fr-card-meta { display: flex; flex-wrap: wrap; gap: 8px; }
    .fr-meta-chip {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: #64748b;
      background: #f8fafc; border: 1px solid #f0f2f5;
      padding: 3px 8px; border-radius: 6px;
    }
    .fr-meta-chip i { font-size: 13px; color: #94a3b8; }
    .fr-meta-organizer { color: #6366f1; border-color: #e0e7ff; background: #f5f3ff; }
    .fr-meta-organizer i { color: #6366f1; }

    .fr-card-desc { font-size: 13px; color: #475569; margin: 0; line-height: 1.5;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

    /* Invités */
    .fr-attendees { display: flex; align-items: center; gap: 10px; }
    .fr-att-label { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #94a3b8; flex-shrink: 0; }
    .fr-att-label i { font-size: 14px; }
    .fr-att-chips { display: flex; gap: 3px; align-items: center; }
    .fr-att-chip {
      width: 26px; height: 26px; border-radius: 50%;
      background: #e0e7ff; color: #4f46e5;
      display: flex; align-items: center; justify-content: center;
      font-size: 9px; font-weight: 800; cursor: default; border: 2px solid #fff;
    }
    .fr-att-chip[data-resp="ACCEPTED"] { background: #d1fae5; color: #065f46; }
    .fr-att-chip[data-resp="DECLINED"] { background: #fee2e2; color: #991b1b; }
    .fr-att-more { font-size: 11px; color: #94a3b8; }

    /* Actions membres */
    .fr-card-actions { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 2px; }
    .fr-btn-join {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 6px 14px; background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; border: none; border-radius: 8px; font-size: 12px;
      font-weight: 700; cursor: pointer; transition: opacity .15s;
    }
    .fr-btn-join:hover { opacity: .85; }
    .fr-btn-accept {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 12px; background: #059669; color: #fff;
      border: none; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: opacity .13s;
    }
    .fr-btn-accept:hover { opacity: .88; }
    .fr-btn-decline {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 5px 12px; background: #fff; color: #dc2626;
      border: 1px solid #fca5a5; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer;
      transition: background .13s;
    }
    .fr-btn-decline:hover { background: #fee2e2; }
    .fr-resp-badge {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 999px;
    }
    .fr-resp-accepted { color: #065f46; background: #d1fae5; }
    .fr-resp-declined { color: #991b1b; background: #fee2e2; }
    .fr-resp-cancelled { color: #6b7280; background: #f3f4f6; }

    /* ======= Modal overlay ======= */
    .fr-overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,.6);
      z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px;
      animation: fade-in .15s ease;
    }

    /* ======= Modal confirmation annulation ======= */
    .fr-confirm-modal {
      background: #fff; border-radius: 18px; padding: 32px 28px;
      max-width: 420px; width: 100%;
      box-shadow: 0 24px 64px rgba(0,0,0,.22);
      text-align: center;
    }
    .fr-confirm-icon {
      width: 64px; height: 64px; border-radius: 50%;
      background: #fee2e2; color: #dc2626;
      display: flex; align-items: center; justify-content: center;
      font-size: 30px; margin: 0 auto 18px;
    }
    .fr-confirm-modal h3 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
    .fr-confirm-modal p { font-size: 14px; color: #475569; margin: 0 0 10px; line-height: 1.5; }
    .fr-confirm-modal p strong { color: #0f172a; }
    .fr-confirm-modal p span { font-size: 13px; color: #94a3b8; }
    .fr-confirm-warn {
      font-size: 12px !important; color: #b45309 !important;
      background: #fef3c7; border-radius: 8px; padding: 8px 12px;
      margin-top: 4px !important;
    }
    .fr-confirm-actions { display: flex; gap: 10px; margin-top: 22px; }
    .fr-confirm-actions .fr-btn-ghost { flex: 1; }
    .fr-btn-cancel-confirm {
      flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 18px; background: #dc2626; color: #fff;
      border: none; border-radius: 9px; font-size: 13px; font-weight: 700;
      cursor: pointer; transition: opacity .13s;
    }
    .fr-btn-cancel-confirm:hover { opacity: .88; }
    .fr-btn-cancel-confirm:disabled { opacity: .5; cursor: not-allowed; }

    /* ======= Modal création ======= */
    .fr-modal {
      background: #fff; width: 100%; max-width: 620px;
      border-radius: 16px; max-height: 92vh; overflow-y: auto;
      box-shadow: 0 24px 60px rgba(0,0,0,.2);
    }
    .fr-modal-head {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 18px 22px; border-bottom: 1px solid #f1f5f9;
      position: sticky; top: 0; background: #fff; z-index: 1;
    }
    .fr-modal-head h3 { margin: 0 0 3px; font-size: 17px; font-weight: 800; color: #0f172a; }
    .fr-modal-sub { font-size: 12px; color: #94a3b8; margin: 0; }
    .fr-close {
      background: none; border: none; font-size: 26px; color: #94a3b8;
      cursor: pointer; line-height: 1; padding: 0 4px; margin-top: -2px;
    }
    .fr-form { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }
    .fr-field-label { display: block; font-size: 13px; font-weight: 700; color: #374151; }
    .fr-input {
      display: block; width: 100%; margin-top: 6px;
      padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
      font-size: 14px; color: #0f172a; background: #fff;
      transition: border-color .15s, box-shadow .15s; box-sizing: border-box;
    }
    .fr-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.12); }
    .fr-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .fr-form-actions { display: flex; justify-content: flex-end; gap: 10px; padding-top: 4px; }
    .fr-form-error {
      color: #dc2626; font-size: 13px; margin: 0;
      display: flex; align-items: center; gap: 6px;
      background: #fee2e2; padding: 8px 12px; border-radius: 8px;
    }

    /* Modalité cards */
    .fr-modality-group { display: flex; flex-direction: column; gap: 8px; }
    .fr-modality-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 8px; }
    .fr-mod-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 14px 8px; border: 2px solid #e2e8f0; border-radius: 12px;
      cursor: pointer; transition: all .15s; text-align: center;
    }
    .fr-mod-card input { display: none; }
    .fr-mod-card:hover { border-color: #a5b4fc; background: #f5f3ff; }
    .fr-mod-card.selected { border-color: #6366f1; background: #eef2ff; }
    .fr-mod-icon { font-size: 26px; }
    .fr-mod-name { font-size: 12px; font-weight: 700; color: #1e293b; }
    .fr-mod-desc { font-size: 11px; color: #94a3b8; }

    /* Invités */
    .fr-invite-search { position: relative; margin-top: 6px; margin-bottom: 6px; }
    .fr-invite-search-icon {
      position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
      color: #94a3b8; font-size: 15px; pointer-events: none;
    }
    .fr-input-search { padding-left: 32px !important; }
    .fr-invite-list {
      max-height: 180px; overflow-y: auto; border: 1px solid #e2e8f0;
      border-radius: 8px; padding: 4px; background: #fafafa; margin-top: 6px;
    }
    .fr-invite-row {
      display: flex; align-items: center; gap: 10px;
      padding: 7px 8px; border-radius: 7px; cursor: pointer;
      transition: background .1s; font-weight: 400;
    }
    .fr-invite-row:hover { background: #ede9fe; }
    .fr-invite-avatar {
      width: 32px; height: 32px; border-radius: 50%; background: #e0e7ff;
      color: #4f46e5; display: flex; align-items: center; justify-content: center;
      font-size: 11px; font-weight: 800; flex-shrink: 0;
    }
    .fr-invite-info { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .fr-invite-name { font-size: 13px; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fr-invite-email { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .fr-invite-check { color: #6366f1; font-size: 16px; flex-shrink: 0; }
    .fr-selected-hint {
      font-size: 12px; color: #6366f1; font-weight: 600; margin: 6px 0 0;
      display: flex; align-items: center; gap: 4px;
    }
    .fr-empty-invite { font-size: 13px; color: #94a3b8; text-align: center; padding: 14px 0; margin: 0; }
  `]
})
export class FrontofficeReunionsComponent implements OnInit {

  allMeetings: Meeting[] = [];
  filtered: Meeting[] = [];
  activeTab: FilterTab = 'ALL';
  loading = true;

  // Formulaire création
  showForm = false;
  submitting = false;
  formError: string | null = null;
  draft: MeetingRequest = this.emptyDraft();
  selectedIds = new Set<number>();
  inviteSearch = '';

  // Annulation avec confirmation
  meetingToCancel: Meeting | null = null;
  cancelling = false;

  // Menu contextuel par carte
  openMenuId: number | null = null;

  orgUsers: User[] = [];
  projects: { id: number; name: string }[] = [];

  private currentUserId: number | null = null;

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private userService: UserService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.loadMeetings();
    this.loadOrgUsers();
    this.loadProjects();
  }

  // ── Données ─────────────────────────────────────────────

  loadMeetings(): void {
    this.loading = true;
    this.meetingService.getAllMyMeetings().subscribe({
      next: (list) => {
        this.allMeetings = list;
        this.applyTab();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadOrgUsers(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        // Exclure l'utilisateur courant (l'organisateur)
        this.orgUsers = users.filter(u => u.id !== this.currentUserId);
      },
      error: () => { this.orgUsers = []; }
    });
  }

  loadProjects(): void {
    this.projectService.getAll().subscribe({
      next: (list: Project[]) => {
        this.projects = list.map(p => ({ id: p.id, name: p.name }));
      },
      error: () => { this.projects = []; }
    });
  }

  // ── Filtres ─────────────────────────────────────────────

  setTab(tab: FilterTab): void {
    this.activeTab = tab;
    this.applyTab();
  }

  applyTab(): void {
    const now = new Date();
    this.filtered = this.allMeetings.filter(m => {
      const date = new Date(m.scheduledAt);
      if (this.activeTab === 'UPCOMING') return date >= now && m.status !== 'CANCELLED';
      if (this.activeTab === 'PAST')     return date < now || m.status === 'COMPLETED' || m.status === 'CANCELLED';
      return true;
    });
  }

  get upcomingCount(): number {
    const now = new Date();
    return this.allMeetings.filter(m => new Date(m.scheduledAt) >= now && m.status !== 'CANCELLED').length;
  }

  get pastCount(): number {
    const now = new Date();
    return this.allMeetings.filter(m => new Date(m.scheduledAt) < now || m.status === 'COMPLETED' || m.status === 'CANCELLED').length;
  }

  // ── Invités filtrage ─────────────────────────────────────

  get filteredOrgUsers(): User[] {
    const q = this.inviteSearch.toLowerCase().trim();
    if (!q) return this.orgUsers;
    return this.orgUsers.filter(u =>
      (u.firstName + ' ' + u.lastName + ' ' + u.email).toLowerCase().includes(q)
    );
  }

  toggleInvite(userId: number, evt: Event): void {
    if ((evt.target as HTMLInputElement).checked) this.selectedIds.add(userId);
    else this.selectedIds.delete(userId);
  }

  // ── Permissions ──────────────────────────────────────────

  canManage(m: Meeting): boolean {
    return m.organizerId === this.currentUserId || this.authService.isAdminUser();
  }

  canJoin(m: Meeting): boolean {
    if (!m.modality || m.modality === 'PRESENTIEL') return false;
    if (m.status === 'CANCELLED' || m.status === 'COMPLETED') return false;
    if (m.organizerId === this.currentUserId) return true;
    return m.attendees?.some(a => a.userId === this.currentUserId && a.response === 'ACCEPTED') ?? false;
  }

  myResponse(m: Meeting): AttendeeResponse | null {
    if (!this.currentUserId) return null;
    const a = m.attendees?.find(x => x.userId === this.currentUserId);
    return a ? a.response : null;
  }

  // ── Actions ──────────────────────────────────────────────

  joinOnline(m: Meeting): void {
    this.router.navigate(['/frontoffice/meetings', m.id, 'room']);
  }

  respond(m: Meeting, response: AttendeeResponse): void {
    this.meetingService.respond(m.id, response).subscribe({
      next: (updated) => this.replaceMeeting(updated),
      error: () => {}
    });
  }

  changeStatus(m: Meeting, status: MeetingStatus): void {
    this.meetingService.changeStatus(m.id, status).subscribe({
      next: (updated) => {
        this.replaceMeeting(updated);
        this.applyTab();
      },
      error: () => {}
    });
  }

  // ── Annulation avec confirmation ─────────────────────────

  askCancel(m: Meeting): void {
    this.meetingToCancel = m;
  }

  confirmCancel(): void {
    if (!this.meetingToCancel) return;
    this.cancelling = true;
    this.meetingService.changeStatus(this.meetingToCancel.id, 'CANCELLED').subscribe({
      next: (updated) => {
        this.replaceMeeting(updated);
        this.applyTab();
        this.meetingToCancel = null;
        this.cancelling = false;
      },
      error: () => { this.cancelling = false; }
    });
  }

  // ── Menu contextuel ──────────────────────────────────────

  toggleMenu(id: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  closeMenu(): void { this.openMenuId = null; }

  // ── Formulaire ───────────────────────────────────────────

  openForm(): void {
    this.draft = this.emptyDraft();
    this.selectedIds = new Set<number>();
    this.inviteSearch = '';
    this.formError = null;
    this.showForm = true;
  }

  closeForm(): void { this.showForm = false; }

  submit(): void {
    if (!this.draft.title?.trim() || !this.draft.scheduledAt || !this.draft.modality) {
      this.formError = 'Titre, date et modalité sont requis.';
      return;
    }
    this.submitting = true;
    this.formError = null;

    const req: MeetingRequest = {
      ...this.draft,
      projectId: this.draft.projectId || null,
      attendeeUserIds: Array.from(this.selectedIds)
    };

    this.meetingService.create(req).subscribe({
      next: (created) => {
        this.allMeetings = [created, ...this.allMeetings];
        this.applyTab();
        this.submitting = false;
        this.showForm = false;
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Échec de la création.';
        this.submitting = false;
      }
    });
  }

  // ── Affichage ────────────────────────────────────────────

  modalityLabel(m?: MeetingModality): string {
    if (!m) return 'Présentiel';
    return { PRESENTIEL: 'Présentiel', EN_LIGNE: 'En ligne', HYBRIDE: 'Hybride' }[m] || m;
  }

  modalityIcon(m?: MeetingModality): string {
    if (!m) return '🏢';
    return { PRESENTIEL: '🏢', EN_LIGNE: '💻', HYBRIDE: '🔀' }[m] || '';
  }

  typeLabel(t?: MeetingType): string {
    const map: Record<string, string> = {
      STANDUP: 'Standup', RETRO: 'Rétro', SPRINT_PLANNING: 'Sprint Planning',
      REVIEW: 'Review', ONE_ON_ONE: '1-on-1', OTHER: 'Autre'
    };
    return t ? (map[t] || t) : '';
  }

  @HostListener('document:click')
  onDocumentClick(): void { this.openMenuId = null; }

  statusIcon(s?: MeetingStatus): string {
    return { SCHEDULED: '🗓', IN_PROGRESS: '🟡', COMPLETED: '✅', CANCELLED: '❌' }[s as string] || '';
  }

  statusLabel(s?: MeetingStatus): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Planifiée', IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée', CANCELLED: 'Annulée'
    };
    return s ? (map[s] || s) : '';
  }

  responseLabel(r: AttendeeResponse): string {
    return { PENDING: 'En attente', ACCEPTED: 'Accepté', DECLINED: 'Décliné' }[r] || r;
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  initials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2)
      .map(w => w[0].toUpperCase()).join('');
  }

  private replaceMeeting(updated: Meeting): void {
    this.allMeetings = this.allMeetings.map(m => m.id === updated.id ? updated : m);
    this.applyTab();
  }

  private emptyDraft(): MeetingRequest {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return {
      title: '',
      description: '',
      agenda: '',
      type: 'STANDUP' as MeetingType,
      modality: 'PRESENTIEL' as MeetingModality,
      durationMinutes: 30,
      scheduledAt: tomorrow.toISOString().slice(0, 16),
      projectId: null
    };
  }
}
