import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { MeetingService } from 'src/app/core/services/meeting.service';
import {
  AttendeeResponse,
  Meeting,
  MeetingStatus,
  MeetingType
} from 'src/app/shared/models/meeting.model';

/**
 * Widget "Mes prochaines reunions" pour le dashboard.
 * Charge automatiquement /api/meetings/me et affiche les reunions
 * a venir (statut SCHEDULED) avec des boutons d'action contextuels.
 *
 * Usage : <app-my-meetings-widget></app-my-meetings-widget>
 */
@Component({
  selector: 'app-my-meetings-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="mw">
      <header class="mw__head">
        <h4 class="mw__title">
          <span class="mw__icon">&#128197;</span>
          Mes prochaines reunions
        </h4>
        <button type="button" class="mw__reload" (click)="reload()" [disabled]="loading"
                title="Rafraichir">
          &#8634;
        </button>
      </header>

      <p *ngIf="loading" class="mw__msg">Chargement...</p>
      <p *ngIf="error && !loading" class="mw__msg mw__err">{{ error }}</p>

      <ng-container *ngIf="!loading && !error">
        <p *ngIf="!upcoming.length" class="mw__msg">
          &#9989; Aucune reunion a venir.
        </p>

        <ul class="mw__list" *ngIf="upcoming.length">
          <li *ngFor="let m of upcoming" class="mw__card">
            <div class="mw__card-left">
              <div class="mw__date-block">
                <div class="mw__date-day">{{ formatDay(m.scheduledAt) }}</div>
                <div class="mw__date-month">{{ formatMonth(m.scheduledAt) }}</div>
              </div>
            </div>
            <div class="mw__card-body">
              <div class="mw__card-title-row">
                <strong>{{ m.title }}</strong>
                <span class="mw__type-badge" [attr.data-type]="m.type">{{ typeLabel(m.type) }}</span>
              </div>
              <div class="mw__meta">
                <span>&#128344; {{ formatTime(m.scheduledAt) }}</span>
                <span>&middot; {{ m.durationMinutes }}min</span>
                <span>&middot; <em>{{ m.projectName }}</em></span>
              </div>
              <div class="mw__meta">
                <span *ngIf="isOrganizer(m)">Vous organisez</span>
                <span *ngIf="!isOrganizer(m)">Par {{ m.organizerName }}</span>
                <span>&middot; {{ acceptedCount(m) }}/{{ m.attendees.length }} confirmes</span>
              </div>

              <div class="mw__actions" *ngIf="myResponse(m) as resp">
                <ng-container *ngIf="resp === 'PENDING' && !isOrganizer(m)">
                  <button class="mw__btn-accept" (click)="respond(m, 'ACCEPTED')">Accepter</button>
                  <button class="mw__btn-decline" (click)="respond(m, 'DECLINED')">Decliner</button>
                </ng-container>
                <span *ngIf="resp === 'ACCEPTED'" class="mw__pill mw__pill--ok">Vous avez accepte</span>
                <span *ngIf="resp === 'DECLINED'" class="mw__pill mw__pill--ko">Vous avez decline</span>
              </div>
            </div>
          </li>
        </ul>
      </ng-container>
    </section>
  `,
  styles: [`
    .mw {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
      padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .mw__head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px;
    }
    .mw__title { margin: 0; font-size: 16px; color: #111827; display: flex; align-items: center; gap: 8px; }
    .mw__icon { font-size: 20px; }
    .mw__reload {
      background: #F3F4F6; border: 1px solid #e5e7eb; border-radius: 8px;
      width: 32px; height: 32px; cursor: pointer; font-size: 16px; color: #4B5563;
    }
    .mw__reload:disabled { opacity: 0.5; cursor: not-allowed; }
    .mw__msg { margin: 8px 0; color: #6B7280; font-size: 14px; }
    .mw__err { color: #991B1B; }

    .mw__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
    .mw__card {
      display: flex; gap: 14px; padding: 12px; border-radius: 10px;
      border: 1px solid #e5e7eb; background: #F9FAFB;
      transition: background .15s ease;
    }
    .mw__card:hover { background: #fff; border-color: #6D28D9; }

    .mw__date-block {
      width: 56px; flex-shrink: 0; text-align: center;
      background: linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%);
      color: #fff; border-radius: 8px; padding: 8px 4px;
    }
    .mw__date-day { font-size: 22px; font-weight: 700; line-height: 1; }
    .mw__date-month { font-size: 11px; text-transform: uppercase;
      letter-spacing: 0.5px; margin-top: 4px; opacity: 0.9; }

    .mw__card-body { flex: 1; min-width: 0; }
    .mw__card-title-row {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 4px; flex-wrap: wrap;
    }
    .mw__card-title-row strong { color: #111827; font-size: 14px; }
    .mw__type-badge {
      padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700;
      background: #E5E7EB; color: #374151;
    }
    .mw__type-badge[data-type="STANDUP"]        { background: #DBEAFE; color: #1D4ED8; }
    .mw__type-badge[data-type="RETRO"]          { background: #FEF3C7; color: #92400E; }
    .mw__type-badge[data-type="SPRINT_PLANNING"]{ background: #EDE9FE; color: #5B21B6; }
    .mw__type-badge[data-type="REVIEW"]         { background: #D1FAE5; color: #065F46; }
    .mw__type-badge[data-type="ONE_ON_ONE"]     { background: #FCE7F3; color: #9D174D; }

    .mw__meta {
      font-size: 12px; color: #6B7280; margin-bottom: 2px;
      display: flex; flex-wrap: wrap; gap: 4px;
    }
    .mw__meta em { font-style: normal; color: #374151; font-weight: 600; }

    .mw__actions { margin-top: 8px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .mw__btn-accept, .mw__btn-decline {
      padding: 4px 12px; border-radius: 6px; font-size: 12px;
      font-weight: 600; cursor: pointer; border: none;
    }
    .mw__btn-accept  { background: #059669; color: #fff; }
    .mw__btn-decline { background: #fff; color: #DC2626; border: 1px solid #DC2626; }
    .mw__pill {
      padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
    }
    .mw__pill--ok { background: #D1FAE5; color: #065F46; }
    .mw__pill--ko { background: #FEE2E2; color: #991B1B; }
  `]
})
export class MyMeetingsWidgetComponent implements OnInit {
  meetings: Meeting[] = [];
  loading = false;
  error: string | null = null;
  private currentUserId: number | null = null;

  constructor(
    private meetingService: MeetingService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId();
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = null;
    this.meetingService.getMyMeetings().subscribe({
      next: (list) => { this.meetings = list; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Impossible de charger les reunions';
      }
    });
  }

  get upcoming(): Meeting[] {
    const now = new Date();
    return this.meetings
      .filter(m => m.status === 'SCHEDULED' && new Date(m.scheduledAt) >= now)
      .slice(0, 5);
  }

  isOrganizer(m: Meeting): boolean {
    return m.organizerId === this.currentUserId;
  }

  myResponse(m: Meeting): AttendeeResponse | null {
    if (!this.currentUserId) return null;
    const a = m.attendees?.find(x => x.userId === this.currentUserId);
    return a ? a.response : null;
  }

  acceptedCount(m: Meeting): number {
    return (m.attendees || []).filter(a => a.response === 'ACCEPTED').length;
  }

  respond(m: Meeting, response: AttendeeResponse): void {
    this.meetingService.respond(m.id, response).subscribe({
      next: (updated) => {
        this.meetings = this.meetings.map(x => x.id === updated.id ? updated : x);
      },
      error: () => {}
    });
  }

  typeLabel(t: MeetingType): string {
    const m: Record<MeetingType, string> = {
      STANDUP: 'Standup', RETRO: 'Retro', SPRINT_PLANNING: 'Sprint',
      REVIEW: 'Review', ONE_ON_ONE: '1-on-1', OTHER: 'Autre'
    };
    return m[t] || t;
  }

  formatDay(iso: string): string {
    return new Date(iso).getDate().toString().padStart(2, '0');
  }

  formatMonth(iso: string): string {
    const months = ['Jan','Fev','Mar','Avr','Mai','Juin','Juil','Aout','Sep','Oct','Nov','Dec'];
    return months[new Date(iso).getMonth()];
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
