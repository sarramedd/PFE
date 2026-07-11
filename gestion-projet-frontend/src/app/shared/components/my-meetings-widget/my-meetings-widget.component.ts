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
          <i class="bx bx-calendar-event mw__icon"></i>
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
          Aucune reunion a venir.
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
                <span><i class="bx bx-time-five"></i> {{ formatTime(m.scheduledAt) }}</span>
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
      background:
        radial-gradient(circle at top right, rgba(124,58,237,.1), transparent 28%),
        linear-gradient(180deg, rgba(20,12,42,.98), rgba(13,8,28,.98));
      border: 1px solid rgba(124,58,237,.2);
      border-radius: 14px;
      padding: 18px 20px;
      box-shadow: 0 8px 28px rgba(10,5,25,.35);
    }
    .mw__head {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(124,58,237,.15);
    }
    .mw__title {
      margin: 0; font-size: 15px; color: #fff;
      display: flex; align-items: center; gap: 8px; font-weight: 700;
    }
    .mw__icon { font-size: 18px; color: #c4b5fd; }
    .mw__reload {
      background: rgba(124,58,237,.15);
      border: 1px solid rgba(124,58,237,.3);
      border-radius: 8px;
      width: 32px; height: 32px; cursor: pointer; font-size: 16px; color: #c4b5fd;
      transition: background .15s;
    }
    .mw__reload:hover { background: rgba(124,58,237,.28); }
    .mw__reload:disabled { opacity: 0.4; cursor: not-allowed; }
    .mw__msg { margin: 8px 0; color: rgba(226,232,240,.65); font-size: 14px; }
    .mw__err { color: #fca5a5; }

    .mw__list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .mw__card {
      display: flex; gap: 14px; padding: 12px; border-radius: 10px;
      border: 1px solid rgba(124,58,237,.15);
      background: rgba(124,58,237,.05);
      transition: background .15s ease, border-color .15s;
    }
    .mw__card:hover { background: rgba(124,58,237,.1); border-color: rgba(167,139,250,.4); }

    .mw__date-block {
      width: 52px; flex-shrink: 0; text-align: center;
      background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%);
      color: #fff; border-radius: 8px; padding: 8px 4px;
      box-shadow: 0 4px 12px rgba(124,58,237,.35);
    }
    .mw__date-day { font-size: 21px; font-weight: 800; line-height: 1; }
    .mw__date-month { font-size: 10px; text-transform: uppercase;
      letter-spacing: 0.5px; margin-top: 4px; opacity: 0.85; }

    .mw__card-body { flex: 1; min-width: 0; }
    .mw__card-title-row {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 5px; flex-wrap: wrap;
    }
    .mw__card-title-row strong { color: #fff; font-size: 13px; font-weight: 700; }

    .mw__type-badge {
      padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 700;
      background: rgba(124,58,237,.2); color: #c4b5fd;
    }
    .mw__type-badge[data-type="STANDUP"]        { background: rgba(59,130,246,.18); color: #93c5fd; }
    .mw__type-badge[data-type="RETRO"]          { background: rgba(245,158,11,.18); color: #fcd34d; }
    .mw__type-badge[data-type="SPRINT_PLANNING"]{ background: rgba(124,58,237,.22); color: #ddd6fe; }
    .mw__type-badge[data-type="REVIEW"]         { background: rgba(16,185,129,.18); color: #6ee7b7; }
    .mw__type-badge[data-type="ONE_ON_ONE"]     { background: rgba(244,63,94,.16);  color: #fda4af; }

    .mw__meta {
      font-size: 11.5px; color: rgba(226,232,240,.6); margin-bottom: 3px;
      display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
    }
    .mw__meta em { font-style: normal; color: #c4b5fd; font-weight: 600; }
    .mw__meta i { color: #a78bfa; }

    .mw__actions { margin-top: 8px; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
    .mw__btn-accept, .mw__btn-decline {
      padding: 4px 12px; border-radius: 6px; font-size: 12px;
      font-weight: 600; cursor: pointer;
    }
    .mw__btn-accept  { background: rgba(16,185,129,.2); color: #6ee7b7; border: 1px solid rgba(16,185,129,.35); }
    .mw__btn-accept:hover { background: rgba(16,185,129,.32); }
    .mw__btn-decline { background: rgba(239,68,68,.15); color: #fca5a5; border: 1px solid rgba(239,68,68,.3); }
    .mw__btn-decline:hover { background: rgba(239,68,68,.25); }
    .mw__pill {
      padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 600;
    }
    .mw__pill--ok { background: rgba(16,185,129,.18); color: #6ee7b7; }
    .mw__pill--ko { background: rgba(239,68,68,.15); color: #fca5a5; }
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
