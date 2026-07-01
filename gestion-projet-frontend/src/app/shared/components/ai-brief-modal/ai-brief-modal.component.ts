import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AiBriefService } from 'src/app/core/services/ai-brief.service';
import { ProjectBrief } from 'src/app/shared/models/project-brief.model';

/**
 * Modale "Brief IA d'un projet".
 *
 * Usage :
 *   <app-ai-brief-modal [projectId]="project.id"></app-ai-brief-modal>
 *
 * Le composant affiche un bouton "Resume IA". Au clic, il appelle
 * /api/ai/project/{id}/brief et affiche le resultat dans un overlay.
 *
 * Composant standalone : importez-le directement dans le composant parent
 * (imports: [AiBriefModalComponent, ...]).
 */
@Component({
  selector: 'app-ai-brief-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="ai-brief-btn" type="button" (click)="open()" [disabled]="loading">
      <span class="ai-brief-btn__icon">&#10024;</span>
      {{ loading ? 'Analyse en cours...' : 'Resume IA' }}
    </button>

    <div *ngIf="visible" class="ai-brief-overlay" (click)="close()">
      <div class="ai-brief-modal" (click)="$event.stopPropagation()">
        <header class="ai-brief-modal__header">
          <h3>Brief du projet</h3>
          <button type="button" class="ai-brief-modal__close" (click)="close()">&times;</button>
        </header>

        <div class="ai-brief-modal__body">
          <ng-container *ngIf="loading">
            <p class="ai-brief-loading">L'IA analyse votre projet...</p>
          </ng-container>

          <ng-container *ngIf="error && !loading">
            <p class="ai-brief-error">{{ error }}</p>
          </ng-container>

          <ng-container *ngIf="brief && !loading">
            <section class="ai-brief-section">
              <p class="ai-brief-summary">{{ brief.summary }}</p>
            </section>

            <section class="ai-brief-section ai-brief-meta">
              <div class="ai-brief-progress">
                <span class="ai-brief-progress__label">Avancement</span>
                <div class="ai-brief-progress__bar">
                  <div class="ai-brief-progress__fill"
                       [style.width.%]="brief.progressPercent"></div>
                </div>
                <span class="ai-brief-progress__value">{{ brief.progressPercent }}%</span>
              </div>
              <span class="ai-brief-risk" [attr.data-level]="brief.riskLevel">
                Risque : {{ brief.riskLevel }}
              </span>
            </section>

            <section *ngIf="brief.blockers?.length" class="ai-brief-section">
              <h4>Blockers</h4>
              <ul>
                <li *ngFor="let b of brief.blockers">{{ b }}</li>
              </ul>
            </section>

            <section *ngIf="brief.risks?.length" class="ai-brief-section">
              <h4>Risques identifies</h4>
              <ul>
                <li *ngFor="let r of brief.risks">{{ r }}</li>
              </ul>
            </section>

            <section *ngIf="brief.suggestions?.length" class="ai-brief-section">
              <h4>Suggestions</h4>
              <ul>
                <li *ngFor="let s of brief.suggestions">{{ s }}</li>
              </ul>
            </section>

            <footer class="ai-brief-modal__footer">
              <small>Genere par {{ brief.model }}</small>
              <button type="button" (click)="reload()">Regenerer</button>
            </footer>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-brief-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 14px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%);
      color: #fff; font-weight: 600; cursor: pointer;
      box-shadow: 0 2px 6px rgba(109, 40, 217, 0.3);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .ai-brief-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(109, 40, 217, 0.4);
    }
    .ai-brief-btn:disabled { opacity: 0.6; cursor: progress; }
    .ai-brief-btn__icon { font-size: 16px; }

    .ai-brief-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
    }
    .ai-brief-modal {
      background: #fff; border-radius: 14px; width: 100%; max-width: 640px;
      max-height: 85vh; overflow: hidden; display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .ai-brief-modal__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 20px; border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #EDE9FE 0%, #DBEAFE 100%);
    }
    .ai-brief-modal__header h3 { margin: 0; font-size: 18px; color: #1F2937; }
    .ai-brief-modal__close {
      background: none; border: none; font-size: 26px; cursor: pointer; color: #4B5563;
    }
    .ai-brief-modal__body { padding: 20px; overflow-y: auto; }

    .ai-brief-section { margin-bottom: 18px; }
    .ai-brief-section h4 {
      margin: 0 0 8px; font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280;
    }
    .ai-brief-section ul { margin: 0; padding-left: 20px; color: #374151; }
    .ai-brief-section li { margin-bottom: 6px; line-height: 1.5; }

    .ai-brief-summary {
      margin: 0; padding: 14px; border-radius: 8px;
      background: #F3F4F6; font-size: 15px; line-height: 1.6; color: #1F2937;
    }

    .ai-brief-meta {
      display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    }
    .ai-brief-progress {
      display: flex; align-items: center; gap: 10px; flex: 1; min-width: 220px;
    }
    .ai-brief-progress__label { font-size: 12px; color: #6B7280; font-weight: 600; }
    .ai-brief-progress__bar {
      flex: 1; height: 10px; background: #E5E7EB; border-radius: 999px; overflow: hidden;
    }
    .ai-brief-progress__fill {
      height: 100%; background: linear-gradient(90deg, #6D28D9, #1D4ED8);
      transition: width .4s ease;
    }
    .ai-brief-progress__value { font-weight: 700; color: #1F2937; }

    .ai-brief-risk {
      padding: 4px 10px; border-radius: 999px;
      font-size: 12px; font-weight: 700; letter-spacing: 0.3px;
    }
    .ai-brief-risk[data-level="LOW"]    { background: #D1FAE5; color: #065F46; }
    .ai-brief-risk[data-level="MEDIUM"] { background: #FEF3C7; color: #92400E; }
    .ai-brief-risk[data-level="HIGH"]   { background: #FEE2E2; color: #991B1B; }

    .ai-brief-loading {
      text-align: center; color: #6B7280; padding: 24px 0; font-style: italic;
    }
    .ai-brief-error { color: #991B1B; }

    .ai-brief-modal__footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 14px; border-top: 1px solid #e5e7eb; margin-top: 12px;
    }
    .ai-brief-modal__footer small { color: #6B7280; }
    .ai-brief-modal__footer button {
      padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px;
      background: #fff; cursor: pointer; font-weight: 600; color: #374151;
    }
    .ai-brief-modal__footer button:hover { background: #f9fafb; }
  `]
})
export class AiBriefModalComponent {
  @Input({ required: true }) projectId!: number;

  visible = false;
  loading = false;
  brief: ProjectBrief | null = null;
  error: string | null = null;

  constructor(private aiBriefService: AiBriefService) {}

  open(): void {
    this.visible = true;
    if (!this.brief && !this.loading) {
      this.fetch();
    }
  }

  close(): void {
    this.visible = false;
  }

  reload(): void {
    this.brief = null;
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;
    this.aiBriefService.getProjectBrief(this.projectId).subscribe({
      next: (b) => { this.brief = b; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message
          || "L'IA n'a pas pu generer le brief. Reessayez dans un instant.";
      }
    });
  }
}
