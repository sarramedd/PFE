import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AiAssistantService } from 'src/app/core/services/ai-assistant.service';
import { AssigneeSuggestion } from 'src/app/shared/models/ai-assistant.model';

/**
 * Bouton "Suggerer un assignee" qui ouvre un popover avec les meilleurs
 * candidats. Au clic sur un candidat, emet l'userId selectionne.
 *
 * Usage :
 *   <app-ai-suggest-assignee
 *     [projectId]="project.id"
 *     [title]="taskTitle"
 *     [description]="taskDescription"
 *     (pick)="onAssigneePicked($event)">
 *   </app-ai-suggest-assignee>
 */
@Component({
  selector: 'app-ai-suggest-assignee',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="ai-btn" (click)="toggle()" [disabled]="loading">
      <span>&#129504;</span>
      {{ loading ? 'Analyse...' : 'Suggerer un assignee' }}
    </button>

    <div *ngIf="open" class="ai-popover">
      <p *ngIf="loading" class="ai-loading">L'IA analyse la charge de l'equipe...</p>
      <p *ngIf="error && !loading" class="ai-err">{{ error }}</p>

      <ng-container *ngIf="suggestions.length && !loading">
        <p class="ai-popover__title">Suggestions IA</p>
        <ul class="ai-list">
          <li *ngFor="let s of suggestions" class="ai-card" (click)="select(s)">
            <div class="ai-card__header">
              <strong>{{ s.name || s.email }}</strong>
              <span class="ai-score" [attr.data-score]="bucket(s.score)">{{ s.score }}/100</span>
            </div>
            <div class="ai-card__meta">
              <span>Charge actuelle : {{ s.currentLoad }} tache(s)</span>
            </div>
            <p class="ai-card__reason">{{ s.reason }}</p>
          </li>
        </ul>
      </ng-container>

      <p *ngIf="!loading && !error && !suggestions.length" class="ai-empty">
        Aucune suggestion (membres absents ?)
      </p>
    </div>
  `,
  styles: [`
    .ai-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #047857 0%, #1D4ED8 100%);
      color: #fff; font-weight: 600; font-size: 13px; cursor: pointer;
    }
    .ai-btn:disabled { opacity: 0.5; }
    .ai-popover {
      margin-top: 8px; padding: 12px; border: 1px solid #e5e7eb;
      border-radius: 10px; background: #fff;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08); max-width: 420px;
    }
    .ai-popover__title { margin: 0 0 8px; font-size: 12px; color: #6B7280;
      text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
    .ai-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
    .ai-card {
      padding: 10px; border: 1px solid #e5e7eb; border-radius: 8px;
      cursor: pointer; transition: background .15s ease;
    }
    .ai-card:hover { background: #F9FAFB; border-color: #6D28D9; }
    .ai-card__header { display: flex; justify-content: space-between; align-items: center; }
    .ai-card__meta { font-size: 12px; color: #6B7280; margin-top: 4px; }
    .ai-card__reason { margin: 6px 0 0; font-size: 13px; color: #374151; line-height: 1.4; }
    .ai-score { padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 700; }
    .ai-score[data-score="HIGH"]   { background: #D1FAE5; color: #065F46; }
    .ai-score[data-score="MEDIUM"] { background: #FEF3C7; color: #92400E; }
    .ai-score[data-score="LOW"]    { background: #FEE2E2; color: #991B1B; }
    .ai-loading { color: #6B7280; font-style: italic; margin: 0; }
    .ai-err { color: #991B1B; margin: 0; }
    .ai-empty { color: #6B7280; margin: 0; font-size: 13px; }
  `]
})
export class AiSuggestAssigneeComponent {
  @Input({ required: true }) projectId!: number;
  @Input() title = '';
  @Input() description = '';
  @Output() pick = new EventEmitter<AssigneeSuggestion>();

  open = false;
  loading = false;
  suggestions: AssigneeSuggestion[] = [];
  error: string | null = null;

  constructor(private ai: AiAssistantService) {}

  toggle(): void {
    this.open = !this.open;
    if (this.open && !this.suggestions.length && !this.loading) {
      this.fetch();
    }
  }

  select(s: AssigneeSuggestion): void {
    this.pick.emit(s);
    this.open = false;
  }

  bucket(score: number): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;
    this.ai.suggestAssignee({
      projectId: this.projectId,
      title: this.title,
      description: this.description
    }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.suggestions = resp.suggestions || [];
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || "Echec suggestion IA";
      }
    });
  }
}
