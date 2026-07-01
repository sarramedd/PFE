import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AiAssistantService } from 'src/app/core/services/ai-assistant.service';
import { RiskTask } from 'src/app/shared/models/ai-assistant.model';

/**
 * Widget "Taches a risque" pour le dashboard projet.
 * Au montage, appelle /api/ai/project/{id}/risk-tasks et affiche
 * les taches a risque triees par score decroissant.
 *
 * Usage :
 *   <app-ai-risk-tasks [projectId]="project.id"></app-ai-risk-tasks>
 */
@Component({
  selector: 'app-ai-risk-tasks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="risk-widget">
      <header class="risk-widget__header">
        <h4>&#9888;&#65039; Taches a risque <small>(detection IA)</small></h4>
        <button type="button" (click)="reload()" [disabled]="loading">
          {{ loading ? '...' : 'Rafraichir' }}
        </button>
      </header>

      <p *ngIf="loading" class="risk-loading">Analyse en cours...</p>
      <p *ngIf="error && !loading" class="risk-err">{{ error }}</p>

      <ng-container *ngIf="!loading && !error">
        <p *ngIf="!riskTasks.length" class="risk-empty">
          &#9989; Aucun risque detecte sur les taches actives.
        </p>
        <ul *ngIf="riskTasks.length" class="risk-list">
          <li *ngFor="let t of riskTasks" class="risk-card" [attr.data-level]="t.riskLevel">
            <div class="risk-card__head">
              <strong>{{ t.title }}</strong>
              <span class="risk-badge" [attr.data-level]="t.riskLevel">
                {{ t.riskLevel }} &middot; {{ t.riskScore }}/100
              </span>
            </div>
            <div class="risk-card__meta">
              <span *ngIf="t.dueDate && t.dueDate !== 'null'">Echeance : {{ t.dueDate }}</span>
              <span *ngIf="t.assignedTo">&middot; Assigne : {{ t.assignedTo }}</span>
            </div>
            <p class="risk-card__reason"><strong>Pourquoi :</strong> {{ t.reason }}</p>
            <p class="risk-card__reco"><strong>Action :</strong> {{ t.recommendation }}</p>
          </li>
        </ul>
      </ng-container>
    </section>
  `,
  styles: [`
    .risk-widget {
      border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;
      background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .risk-widget__header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 12px;
    }
    .risk-widget__header h4 { margin: 0; font-size: 15px; color: #1F2937; }
    .risk-widget__header h4 small { color: #6B7280; font-weight: 400; }
    .risk-widget__header button {
      padding: 4px 10px; border: 1px solid #d1d5db; border-radius: 6px;
      background: #fff; cursor: pointer; font-size: 12px;
    }
    .risk-list { list-style: none; padding: 0; margin: 0;
      display: flex; flex-direction: column; gap: 10px; }
    .risk-card {
      padding: 12px; border-radius: 10px;
      border-left: 4px solid #6B7280; background: #F9FAFB;
    }
    .risk-card[data-level="HIGH"]   { border-left-color: #DC2626; background: #FEF2F2; }
    .risk-card[data-level="MEDIUM"] { border-left-color: #D97706; background: #FFFBEB; }
    .risk-card[data-level="LOW"]    { border-left-color: #059669; background: #F0FDF4; }
    .risk-card__head { display: flex; justify-content: space-between; gap: 8px; align-items: center; }
    .risk-card__meta { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .risk-card__reason, .risk-card__reco { margin: 6px 0 0; font-size: 13px; color: #374151; }
    .risk-badge {
      padding: 3px 8px; border-radius: 999px; font-size: 11px; font-weight: 700;
    }
    .risk-badge[data-level="HIGH"]   { background: #FEE2E2; color: #991B1B; }
    .risk-badge[data-level="MEDIUM"] { background: #FEF3C7; color: #92400E; }
    .risk-badge[data-level="LOW"]    { background: #D1FAE5; color: #065F46; }
    .risk-loading, .risk-empty, .risk-err {
      margin: 0; font-size: 14px; color: #6B7280;
    }
    .risk-err { color: #991B1B; }
  `]
})
export class AiRiskTasksComponent implements OnChanges {
  @Input({ required: true }) projectId!: number;

  riskTasks: RiskTask[] = [];
  loading = false;
  error: string | null = null;

  constructor(private ai: AiAssistantService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectId'] && this.projectId) {
      this.fetch();
    }
  }

  reload(): void {
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;
    this.ai.detectRiskTasks(this.projectId).subscribe({
      next: (resp) => {
        this.loading = false;
        this.riskTasks = (resp.atRiskTasks || [])
          .sort((a, b) => b.riskScore - a.riskScore);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || "Echec detection IA";
      }
    });
  }
}
