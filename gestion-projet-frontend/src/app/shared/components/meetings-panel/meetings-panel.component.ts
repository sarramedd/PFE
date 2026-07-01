import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ProjectMemberService } from 'src/app/features/admin/projects/services/project-member.service';
import { Role } from 'src/app/shared/models/user.model';
import {
  AttendeeResponse,
  Meeting,
  MeetingRequest,
  MeetingStatus,
  MeetingType
} from 'src/app/shared/models/meeting.model';

interface ProjectMemberLike {
  user: { id: number; firstName?: string; lastName?: string; email?: string };
}

/**
 * Panneau "Reunions" a placer dans la page d'un projet.
 *
 * Usage :
 *   <app-meetings-panel [projectId]="project.id"></app-meetings-panel>
 *
 * Le composant :
 *   - affiche la liste des reunions du projet
 *   - propose un bouton "+ Nouvelle reunion" si l'utilisateur est PM/Admin
 *   - permet d'accepter / decliner une invitation
 *   - permet de changer le statut (terminer, annuler)
 *   - charge la liste des membres du projet pour l'autocomplete des invites
 */
@Component({
  selector: 'app-meetings-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mp">
      <header class="mp__header">
        <h4>&#128197; Reunions du projet</h4>
        <button type="button" class="mp__btn-primary" *ngIf="canCreate" (click)="openForm()">
          + Nouvelle reunion
        </button>
      </header>

      <p *ngIf="loading" class="mp__loading">Chargement...</p>
      <p *ngIf="error && !loading" class="mp__error">{{ error }}</p>

      <ng-container *ngIf="!loading && !error">
        <p *ngIf="!meetings.length" class="mp__empty">
          Aucune reunion planifiee pour ce projet.
        </p>

        <ul class="mp__list">
          <li *ngFor="let m of meetings" class="mp__card" [attr.data-status]="m.status">
            <div class="mp__card-head">
              <div>
                <strong class="mp__title">{{ m.title }}</strong>
                <span class="mp__badge" [attr.data-type]="m.type">{{ typeLabel(m.type) }}</span>
                <span class="mp__status" [attr.data-status]="m.status">{{ statusLabel(m.status) }}</span>
              </div>
              <div class="mp__date">
                {{ formatDate(m.scheduledAt) }} &middot; {{ m.durationMinutes }}min
              </div>
            </div>
            <p class="mp__desc" *ngIf="m.description">{{ m.description }}</p>
            <details class="mp__details" *ngIf="m.agenda || m.notes">
              <summary>Voir agenda / notes</summary>
              <div *ngIf="m.agenda">
                <h5>Agenda</h5><pre>{{ m.agenda }}</pre>
              </div>
              <div *ngIf="m.notes">
                <h5>Notes</h5><pre>{{ m.notes }}</pre>
              </div>
            </details>

            <div class="mp__attendees" *ngIf="m.attendees?.length">
              <span class="mp__att-label">Invites :</span>
              <span *ngFor="let a of m.attendees" class="mp__att-chip" [attr.data-response]="a.response">
                {{ a.name || a.email }}
              </span>
            </div>

            <div class="mp__actions">
              <!-- Bouton Rejoindre en ligne -->
              <button *ngIf="canJoinOnline(m)"
                      class="mp__btn-join"
                      (click)="joinOnline(m)">
                🎥 Rejoindre en ligne
              </button>

              <!-- L'utilisateur est invite : il peut repondre -->
              <ng-container *ngIf="myResponse(m) as resp">
                <button *ngIf="resp === 'PENDING'" class="mp__btn-success"
                        (click)="respond(m, 'ACCEPTED')">Accepter</button>
                <button *ngIf="resp === 'PENDING'" class="mp__btn-danger"
                        (click)="respond(m, 'DECLINED')">Decliner</button>
                <span *ngIf="resp === 'ACCEPTED'" class="mp__hint">Vous avez accepte</span>
                <span *ngIf="resp === 'DECLINED'" class="mp__hint">Vous avez decline</span>
              </ng-container>

              <!-- Organizer / PM peut terminer / annuler -->
              <ng-container *ngIf="canManage(m)">
                <button *ngIf="m.status === 'SCHEDULED'" class="mp__btn-ghost"
                        (click)="changeStatus(m, 'COMPLETED')">Marquer terminee</button>
                <button *ngIf="m.status === 'SCHEDULED'" class="mp__btn-ghost"
                        (click)="changeStatus(m, 'CANCELLED')">Annuler</button>
                <button class="mp__btn-ghost" (click)="deleteMeeting(m)">Supprimer</button>
              </ng-container>
            </div>
          </li>
        </ul>
      </ng-container>

      <!-- Modale creation -->
      <div *ngIf="showForm" class="mp__overlay" (click)="closeForm()">
        <div class="mp__modal" (click)="$event.stopPropagation()">
          <header class="mp__modal-head">
            <h3>Nouvelle reunion</h3>
            <button type="button" class="mp__close" (click)="closeForm()">&times;</button>
          </header>
          <form class="mp__form" (ngSubmit)="submit()" #f="ngForm">
            <label>Titre *
              <input type="text" [(ngModel)]="draft.title" name="title" required minlength="3" maxlength="200" />
            </label>

            <div class="mp__grid2">
              <label>Type
                <select [(ngModel)]="draft.type" name="type">
                  <option value="STANDUP">Daily standup</option>
                  <option value="RETRO">Retrospective</option>
                  <option value="SPRINT_PLANNING">Sprint planning</option>
                  <option value="REVIEW">Review / Demo</option>
                  <option value="ONE_ON_ONE">1-on-1</option>
                  <option value="OTHER">Autre</option>
                </select>
              </label>
              <label>Duree (min)
                <input type="number" [(ngModel)]="draft.durationMinutes" name="durationMinutes" min="5" max="480" />
              </label>
            </div>

            <label>Date &amp; heure *
              <input type="datetime-local" [(ngModel)]="draft.scheduledAt" name="scheduledAt" required />
            </label>

            <label>Description
              <textarea rows="2" [(ngModel)]="draft.description" name="description" maxlength="2000"></textarea>
            </label>

            <label>Agenda
              <textarea rows="4" [(ngModel)]="draft.agenda" name="agenda" maxlength="4000"
                placeholder="- Point 1&#10;- Point 2&#10;- ..."></textarea>
            </label>

            <label>Invites
              <div class="mp__invites">
                <label *ngFor="let m of projectMembers" class="mp__invite-row">
                  <input type="checkbox"
                    [checked]="selectedAttendeeIds.has(m.user.id)"
                    (change)="toggleAttendee(m.user.id, $event)" />
                  <span>{{ m.user.firstName }} {{ m.user.lastName }} <small>({{ m.user.email }})</small></span>
                </label>
                <p *ngIf="!projectMembers.length" class="mp__hint">Aucun membre dans ce projet.</p>
              </div>
            </label>

            <p *ngIf="formError" class="mp__error">{{ formError }}</p>

            <div class="mp__form-actions">
              <button type="button" class="mp__btn-ghost" (click)="closeForm()">Annuler</button>
              <button type="submit" class="mp__btn-primary" [disabled]="submitting || !f.valid">
                {{ submitting ? 'Creation...' : 'Creer la reunion' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .mp { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fff; }
    .mp__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .mp__header h4 { margin: 0; font-size: 16px; }
    .mp__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .mp__card { padding: 12px; border: 1px solid #e5e7eb; border-radius: 10px; background: #F9FAFB; }
    .mp__card[data-status="CANCELLED"] { opacity: 0.6; }
    .mp__card[data-status="COMPLETED"] { background: #ECFDF5; }
    .mp__card-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .mp__title { font-size: 15px; color: #111827; margin-right: 8px; }
    .mp__badge, .mp__status {
      display: inline-block; margin-left: 6px;
      padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;
      background: #E5E7EB; color: #374151;
    }
    .mp__badge[data-type="STANDUP"]        { background: #DBEAFE; color: #1D4ED8; }
    .mp__badge[data-type="RETRO"]          { background: #FEF3C7; color: #92400E; }
    .mp__badge[data-type="SPRINT_PLANNING"]{ background: #EDE9FE; color: #5B21B6; }
    .mp__badge[data-type="REVIEW"]         { background: #D1FAE5; color: #065F46; }
    .mp__badge[data-type="ONE_ON_ONE"]     { background: #FCE7F3; color: #9D174D; }
    .mp__status[data-status="SCHEDULED"]   { background: #DBEAFE; color: #1D4ED8; }
    .mp__status[data-status="COMPLETED"]   { background: #D1FAE5; color: #065F46; }
    .mp__status[data-status="CANCELLED"]   { background: #FEE2E2; color: #991B1B; }
    .mp__status[data-status="IN_PROGRESS"] { background: #FEF3C7; color: #92400E; }
    .mp__date { font-size: 13px; color: #6B7280; }
    .mp__desc { margin: 8px 0; color: #374151; font-size: 14px; }
    .mp__details { margin-top: 8px; }
    .mp__details pre { white-space: pre-wrap; background: #fff; padding: 8px; border-radius: 6px;
      border: 1px solid #e5e7eb; font-size: 12px; }
    .mp__attendees { margin: 8px 0; font-size: 12px; }
    .mp__att-label { color: #6B7280; margin-right: 6px; }
    .mp__att-chip {
      display: inline-block; padding: 2px 8px; border-radius: 999px;
      background: #E5E7EB; color: #374151; margin: 2px 4px 2px 0; font-size: 11px;
    }
    .mp__att-chip[data-response="ACCEPTED"] { background: #D1FAE5; color: #065F46; }
    .mp__att-chip[data-response="DECLINED"] { background: #FEE2E2; color: #991B1B; }
    .mp__att-chip[data-response="PENDING"]  { background: #FEF3C7; color: #92400E; }
    .mp__actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
    .mp__btn-primary, .mp__btn-success, .mp__btn-danger, .mp__btn-ghost {
      padding: 5px 11px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; border: none;
    }
    .mp__btn-primary  { background: linear-gradient(135deg, #1D4ED8, #6D28D9); color: #fff; }
    .mp__btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .mp__btn-success  { background: #059669; color: #fff; }
    .mp__btn-danger   { background: #DC2626; color: #fff; }
    .mp__btn-ghost    { background: #fff; color: #374151; border: 1px solid #d1d5db; }
    .mp__btn-join     { background: linear-gradient(135deg, #7c3aed, #2563eb); color: #fff;
                        font-size: 13px; padding: 6px 13px; border-radius: 8px; cursor: pointer;
                        border: none; font-weight: 700; letter-spacing: 0.01em;
                        box-shadow: 0 2px 8px rgba(124,58,237,0.25); transition: opacity 0.15s; }
    .mp__btn-join:hover { opacity: 0.88; }
    .mp__hint { font-size: 12px; color: #6B7280; }
    .mp__loading, .mp__empty, .mp__error { margin: 0; color: #6B7280; font-size: 14px; }
    .mp__error { color: #991B1B; }
    .mp__overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 9999;
      display: flex; align-items: center; justify-content: center; padding: 20px; }
    .mp__modal { background: #fff; width: 100%; max-width: 560px; border-radius: 12px;
      max-height: 90vh; overflow-y: auto; }
    .mp__modal-head { display: flex; justify-content: space-between; padding: 14px 18px;
      border-bottom: 1px solid #e5e7eb; }
    .mp__modal-head h3 { margin: 0; font-size: 17px; }
    .mp__close { background: none; border: none; font-size: 24px; cursor: pointer; color: #6B7280; }
    .mp__form { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
    .mp__form label { display: block; font-size: 13px; color: #374151; font-weight: 600; }
    .mp__form input, .mp__form select, .mp__form textarea {
      width: 100%; padding: 8px 10px; border: 1px solid #d1d5db; border-radius: 6px;
      margin-top: 4px; font-size: 14px; font-weight: 400;
    }
    .mp__grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .mp__invites { max-height: 140px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 6px;
      padding: 8px; margin-top: 4px; background: #F9FAFB; }
    .mp__invite-row { display: flex; align-items: center; gap: 8px; font-weight: 400; padding: 4px 0; }
    .mp__form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
  `]
})
export class MeetingsPanelComponent implements OnChanges, OnInit {
  @Input({ required: true }) projectId!: number;

  meetings: Meeting[] = [];
  projectMembers: ProjectMemberLike[] = [];
  loading = false;
  error: string | null = null;

  showForm = false;
  submitting = false;
  formError: string | null = null;
  selectedAttendeeIds = new Set<number>();
  draft: MeetingRequest = this.emptyDraft();

  private currentUserId: number | null = null;

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService,
    private memberService: ProjectMemberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.refresh();
      this.loadMembers();
    }
  }

  get canCreate(): boolean {
    // Le backend refusera si non autorise; on cache juste le bouton pour les members purs
    return this.authService.isAdminUser() || this.authService.getRole() === Role.PROJECT_MANAGER;
  }

  canManage(m: Meeting): boolean {
    return this.canCreate || m.organizerId === this.currentUserId;
  }

  /** Visible pour l'organisateur et les invités ayant accepté, sauf si annulée/terminée. */
  canJoinOnline(m: Meeting): boolean {
    if (m.status === 'CANCELLED' || m.status === 'COMPLETED') return false;
    if (m.organizerId === this.currentUserId) return true;
    const att = m.attendees?.find(a => a.userId === this.currentUserId);
    return !!att && att.response === 'ACCEPTED';
  }

  joinOnline(m: Meeting): void {
    this.router.navigate(['/frontoffice/meetings', m.id, 'room']);
  }

  myResponse(m: Meeting): string | null {
    if (!this.currentUserId) return null;
    const a = m.attendees?.find(x => x.userId === this.currentUserId);
    return a ? a.response : null;
  }

  refresh(): void {
    this.loading = true;
    this.error = null;
    this.meetingService.getByProject(this.projectId).subscribe({
      next: (list) => { this.meetings = list; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Impossible de charger les reunions';
      }
    });
  }

  private loadMembers(): void {
    this.memberService.getMembers(this.projectId).subscribe({
      next: (list: any[]) => { this.projectMembers = list as ProjectMemberLike[]; },
      error: () => { this.projectMembers = []; }
    });
  }

  openForm(): void {
    this.draft = this.emptyDraft();
    this.selectedAttendeeIds = new Set<number>();
    this.formError = null;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
  }

  toggleAttendee(userId: number, evt: Event): void {
    const checked = (evt.target as HTMLInputElement).checked;
    if (checked) this.selectedAttendeeIds.add(userId);
    else this.selectedAttendeeIds.delete(userId);
  }

  submit(): void {
    if (!this.draft.title || !this.draft.scheduledAt) {
      this.formError = 'Titre et date sont requis.';
      return;
    }
    this.submitting = true;
    this.formError = null;

    const req: MeetingRequest = {
      ...this.draft,
      projectId: this.projectId,
      attendeeUserIds: Array.from(this.selectedAttendeeIds)
    };

    this.meetingService.create(req).subscribe({
      next: () => {
        this.submitting = false;
        this.showForm = false;
        this.refresh();
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err?.error?.message || 'Echec de creation';
      }
    });
  }

  respond(m: Meeting, response: AttendeeResponse): void {
    this.meetingService.respond(m.id, response).subscribe({
      next: (updated) => this.replaceMeeting(updated),
      error: (err) => { this.error = err?.error?.message || 'Echec'; }
    });
  }

  changeStatus(m: Meeting, status: MeetingStatus): void {
    this.meetingService.changeStatus(m.id, status).subscribe({
      next: (updated) => this.replaceMeeting(updated),
      error: (err) => { this.error = err?.error?.message || 'Echec'; }
    });
  }

  deleteMeeting(m: Meeting): void {
    if (!confirm('Supprimer cette reunion ?')) return;
    this.meetingService.delete(m.id).subscribe({
      next: () => { this.meetings = this.meetings.filter(x => x.id !== m.id); },
      error: (err) => { this.error = err?.error?.message || 'Echec suppression'; }
    });
  }

  typeLabel(t: MeetingType): string {
    const map: Record<MeetingType, string> = {
      STANDUP: 'Standup',
      RETRO: 'Retro',
      SPRINT_PLANNING: 'Sprint planning',
      REVIEW: 'Review',
      ONE_ON_ONE: '1-on-1',
      OTHER: 'Autre'
    };
    return map[t] || t;
  }

  statusLabel(s: MeetingStatus): string {
    const map: Record<MeetingStatus, string> = {
      SCHEDULED: 'Planifiee',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminee',
      CANCELLED: 'Annulee'
    };
    return map[s] || s;
  }

  formatDate(iso: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  }

  private replaceMeeting(updated: Meeting): void {
    this.meetings = this.meetings.map(m => m.id === updated.id ? updated : m);
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
      durationMinutes: 30,
      scheduledAt: tomorrow.toISOString().slice(0, 16) // format datetime-local
    };
  }
}
