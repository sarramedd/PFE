import {
  Component,
  OnInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingService } from 'src/app/core/services/meeting.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { Meeting } from 'src/app/shared/models/meeting.model';

declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-jitsi-room',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="jitsi-shell">

      <!-- En-tête -->
      <div class="jitsi-topbar">
        <button class="jitsi-back-btn" (click)="leave()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Quitter la réunion
        </button>
        <div class="jitsi-meeting-info" *ngIf="meeting">
          <span class="jitsi-title">{{ meeting.title }}</span>
          <span class="jitsi-badge" [attr.data-status]="meeting.status">{{ statusLabel(meeting.status) }}</span>
          <span class="jitsi-project">{{ meeting.projectName }}</span>
        </div>
        <div class="jitsi-timer" *ngIf="elapsed">{{ elapsed }}</div>
      </div>

      <!-- État de chargement -->
      <div class="jitsi-loading" *ngIf="loading">
        <div class="jitsi-spinner"></div>
        <p>Connexion à la salle en cours…</p>
      </div>

      <!-- Erreur -->
      <div class="jitsi-error" *ngIf="error">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p>{{ error }}</p>
        <button class="jitsi-btn-retry" (click)="retryJoin()">Réessayer</button>
      </div>

      <!-- Conteneur Jitsi -->
      <div class="jitsi-frame-wrapper" [class.hidden]="loading || !!error">
        <div #jitsiContainer id="jitsi-container"></div>
      </div>

    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .jitsi-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #0f0f0f;
      font-family: 'Inter', sans-serif;
    }

    /* ---- Topbar ---- */
    .jitsi-topbar {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 10px 20px;
      background: #1a1a2e;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      flex-shrink: 0;
      min-height: 54px;
    }

    .jitsi-back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(220,38,38,0.15);
      color: #FCA5A5;
      border: 1px solid rgba(220,38,38,0.35);
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background 0.15s;
    }
    .jitsi-back-btn:hover { background: rgba(220,38,38,0.28); }

    .jitsi-meeting-info {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;
    }

    .jitsi-title {
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .jitsi-project {
      color: #94a3b8;
      font-size: 12px;
      white-space: nowrap;
    }

    .jitsi-badge {
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }
    .jitsi-badge[data-status="SCHEDULED"]   { background:#1e3a5f; color:#60a5fa; }
    .jitsi-badge[data-status="IN_PROGRESS"] { background:#14532d; color:#4ade80; }
    .jitsi-badge[data-status="COMPLETED"]   { background:#374151; color:#9ca3af; }
    .jitsi-badge[data-status="CANCELLED"]   { background:#450a0a; color:#fca5a5; }

    .jitsi-timer {
      color: #a3e635;
      font-size: 13px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* ---- Loading ---- */
    .jitsi-loading {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
      gap: 16px;
      font-size: 15px;
    }

    .jitsi-spinner {
      width: 44px; height: 44px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: #6366f1;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ---- Error ---- */
    .jitsi-error {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #FCA5A5;
      gap: 12px;
      font-size: 15px;
      text-align: center;
      padding: 24px;
    }

    .jitsi-btn-retry {
      padding: 8px 20px;
      background: #6366f1;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    /* ---- Frame ---- */
    .jitsi-frame-wrapper {
      flex: 1;
      overflow: hidden;
      position: relative;
    }
    .jitsi-frame-wrapper.hidden { display: none; }

    #jitsi-container {
      width: 100%;
      height: 100%;
    }
    #jitsi-container iframe {
      width: 100% !important;
      height: 100% !important;
      border: none !important;
    }
  `]
})
export class JitsiRoomComponent implements OnInit, OnDestroy {

  meeting: Meeting | null = null;
  loading = true;
  error: string | null = null;
  elapsed = '';

  private api: any = null;
  private meetingId!: number;
  private startedAt: Date | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private scriptLoaded = false;

  private displayName = 'Participant';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private meetingService: MeetingService,
    private authService: AuthService,
    private currentUserService: CurrentUserService,
    private ngZone: NgZone
  ) {
    this.currentUserService.user$.subscribe(u => {
      if (u) {
        this.displayName = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email || 'Participant';
      }
    });
  }

  ngOnInit(): void {
    this.meetingId = Number(this.route.snapshot.paramMap.get('id'));
    this.retryJoin();
  }

  retryJoin(): void {
    this.loading = true;
    this.error = null;

    this.meetingService.joinMeeting(this.meetingId).subscribe({
      next: (m) => {
        this.meeting = m;
        if (!m.roomName) {
          this.error = 'Cette réunion ne possède pas de salle en ligne.';
          this.loading = false;
          return;
        }
        this.loadJitsiScript(() => this.initJitsi(m.roomName!));
      },
      error: (err) => {
        this.error = err?.error?.message || 'Impossible de rejoindre la réunion.';
        this.loading = false;
      }
    });
  }

  leave(): void {
    if (this.api) {
      this.api.executeCommand('hangup');
    }
    this.cleanup();
    this.router.navigate(['/frontoffice/projects']);
  }

  statusLabel(s?: string): string {
    const map: Record<string, string> = {
      SCHEDULED: 'Planifiée', IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminée', CANCELLED: 'Annulée'
    };
    return s ? (map[s] || s) : '';
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // ── Privé ───────────────────────────────────────────────

  private loadJitsiScript(cb: () => void): void {
    if (this.scriptLoaded || typeof JitsiMeetExternalAPI !== 'undefined') {
      this.scriptLoaded = true;
      cb();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      this.scriptLoaded = true;
      this.ngZone.run(() => cb());
    };
    script.onerror = () => {
      this.ngZone.run(() => {
        this.error = 'Impossible de charger la librairie Jitsi. Vérifiez votre connexion internet.';
        this.loading = false;
      });
    };
    document.head.appendChild(script);
  }

  private initJitsi(roomName: string): void {
    // Attendre que le DOM soit prêt
    setTimeout(() => {
      const container = document.getElementById('jitsi-container');
      if (!container) {
        this.error = 'Erreur d\'initialisation de la salle.';
        this.loading = false;
        return;
      }

      const displayName = this.displayName;

      this.api = new JitsiMeetExternalAPI('meet.jit.si', {
        roomName,
        parentNode: container,
        width: '100%',
        height: '100%',
        lang: 'fr',
        userInfo: { displayName },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
          enableNoisyMicDetection: true,
          prejoinPageEnabled: true,
          defaultLanguage: 'fr'
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop',
            'fullscreen', 'fodeviceselection', 'hangup', 'chat',
            'recording', 'raisehand', 'videoquality', 'tileview',
            'select-background', 'mute-everyone', 'settings', 'participants-pane'
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          SHOW_BRAND_WATERMARK: false,
          BRAND_WATERMARK_LINK: '',
          DEFAULT_BACKGROUND: '#1a1a2e',
          DISPLAY_WELCOME_PAGE_CONTENT: false,
          APP_NAME: 'TeamFlow Meeting',
          NATIVE_APP_NAME: 'TeamFlow',
          PROVIDER_NAME: 'TeamFlow'
        }
      });

      this.loading = false;
      this.startedAt = new Date();
      this.startTimer();

      // Évènements Jitsi
      this.api.addEventListener('videoConferenceLeft', () => {
        this.ngZone.run(() => this.leave());
      });

      this.api.addEventListener('readyToClose', () => {
        this.ngZone.run(() => this.leave());
      });

    }, 100);
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (!this.startedAt) return;
      const diff = Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      this.ngZone.run(() => {
        this.elapsed = h > 0
          ? `${h}:${pad(m)}:${pad(s)}`
          : `${pad(m)}:${pad(s)}`;
      });
    }, 1000);
  }

  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.api) {
      try { this.api.dispose(); } catch { /* ignore */ }
      this.api = null;
    }
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
