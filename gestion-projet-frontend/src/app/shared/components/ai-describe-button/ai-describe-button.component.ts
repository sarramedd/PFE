import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AiAssistantService } from 'src/app/core/services/ai-assistant.service';
import { TaskDescriptionResponse } from 'src/app/shared/models/ai-assistant.model';

/**
 * Bouton "Generer avec IA" a placer dans un formulaire de creation de tache.
 * L'utilisateur saisit le titre, clique sur le bouton, et le composant emet
 * la description + criteres + estimation. Le parent applique sur ses champs.
 *
 * Usage :
 *   <app-ai-describe-button
 *     [title]="formTitle"
 *     [projectId]="project.id"
 *     (generated)="onAiGenerated($event)">
 *   </app-ai-describe-button>
 */
@Component({
  selector: 'app-ai-describe-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="ai-btn" (click)="generate()"
            [disabled]="loading || !title?.trim()">
      <span class="ai-btn__icon">&#10024;</span>
      {{ loading ? 'Generation...' : 'Generer avec IA' }}
    </button>
    <small *ngIf="error" class="ai-err">{{ error }}</small>
  `,
  styles: [`
    .ai-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #6D28D9 0%, #1D4ED8 100%);
      color: #fff; font-weight: 600; font-size: 13px; cursor: pointer;
    }
    .ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .ai-btn__icon { font-size: 14px; }
    .ai-err { color: #991B1B; margin-left: 8px; font-size: 12px; }
  `]
})
export class AiDescribeButtonComponent {
  @Input() title: string = '';
  @Input() projectId?: number;
  @Output() generated = new EventEmitter<TaskDescriptionResponse>();

  loading = false;
  error: string | null = null;

  constructor(private ai: AiAssistantService) {}

  generate(): void {
    if (!this.title?.trim()) return;
    this.loading = true;
    this.error = null;
    this.ai.describeTask({
      title: this.title,
      projectId: this.projectId,
      language: 'fr'
    }).subscribe({
      next: (resp) => {
        this.loading = false;
        this.generated.emit(resp);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || "Echec generation IA";
      }
    });
  }
}
