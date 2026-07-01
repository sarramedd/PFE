import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AiAssistantService } from 'src/app/core/services/ai-assistant.service';
import { DiscussionSummaryResponse } from 'src/app/shared/models/ai-assistant.model';

/**
 * Bouton "Resumer la discussion" + modale qui affiche un recap IA
 * des commentaires du projet (summary, key points, decisions, questions).
 *
 * Usage : <app-ai-discussion-summary [projectId]="project.id"></app-ai-discussion-summary>
 */
@Component({
  selector: 'app-ai-discussion-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button type="button" class="ai-btn" (click)="open()" [disabled]="loading">
      <span>&#128172;</span>
      {{ loading ? 'Resume en cours...' : 'Resumer la discussion' }}
    </button>

    <div *ngIf="visible" class="overlay" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal__header">
          <h3>Recap IA de la discussion</h3>
          <button type="button" (click)="close()" class="close">&times;</button>
        </header>

        <div class="modal__body">
          <p *ngIf="loading" class="loading">Synthese en cours...</p>
          <p *ngIf="error && !loading" class="err">{{ error }}</p>

          <ng-container *ngIf="summary && !loading">
            <p class="meta">{{ summary.totalComments }} commentaires analyses</p>

            <section class="block">
              <p class="summary">{{ summary.summary }}</p>
            </section>

            <section *ngIf="summary.keyPoints?.length" class="block">
              <h4>Points cles</h4>
              <ul><li *ngFor="let k of summary.keyPoints">{{ k }}</li></ul>
            </section>

            <section *ngIf="summary.decisions?.length" class="block">
              <h4>Decisions prises</h4>
              <ul><li *ngFor="let d of summary.decisions">{{ d }}</li></ul>
            </section>

            <section *ngIf="summary.openQuestions?.length" class="block">
              <h4>Questions / sujets en suspens</h4>
              <ul><li *ngFor="let q of summary.openQuestions">{{ q }}</li></ul>
            </section>

            <footer class="modal__footer">
              <small>Genere par {{ summary.model }}</small>
              <button type="button" (click)="reload()">Regenerer</button>
            </footer>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ai-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #BE185D 0%, #6D28D9 100%);
      color: #fff; font-weight: 600; font-size: 13px; cursor: pointer;
    }
    .ai-btn:disabled { opacity: 0.5; }
    .overlay {
      position: fixed; inset: 0; background: rgba(15,23,42,0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
    }
    .modal {
      background: #fff; border-radius: 14px; width: 100%; max-width: 620px;
      max-height: 85vh; display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden;
    }
    .modal__header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #FCE7F3 0%, #EDE9FE 100%);
    }
    .modal__header h3 { margin: 0; font-size: 17px; color: #1F2937; }
    .close { background: none; border: none; font-size: 26px; cursor: pointer; color: #4B5563; }
    .modal__body { padding: 20px; overflow-y: auto; }
    .meta { color: #6B7280; font-size: 12px; margin: 0 0 12px; text-transform: uppercase;
      letter-spacing: 0.5px; font-weight: 700; }
    .block { margin-bottom: 18px; }
    .block h4 {
      margin: 0 0 8px; font-size: 13px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px; color: #6B7280;
    }
    .block ul { margin: 0; padding-left: 20px; color: #374151; }
    .block li { margin-bottom: 6px; line-height: 1.5; }
    .summary {
      margin: 0; padding: 14px; border-radius: 8px;
      background: #F3F4F6; font-size: 15px; line-height: 1.6; color: #1F2937;
    }
    .loading { color: #6B7280; font-style: italic; }
    .err { color: #991B1B; }
    .modal__footer {
      display: flex; justify-content: space-between; align-items: center;
      padding-top: 14px; border-top: 1px solid #e5e7eb; margin-top: 12px;
    }
    .modal__footer small { color: #6B7280; }
    .modal__footer button {
      padding: 6px 12px; border: 1px solid #d1d5db; border-radius: 6px;
      background: #fff; cursor: pointer; font-weight: 600; color: #374151;
    }
  `]
})
export class AiDiscussionSummaryComponent {
  @Input({ required: true }) projectId!: number;

  visible = false;
  loading = false;
  summary: DiscussionSummaryResponse | null = null;
  error: string | null = null;

  constructor(private ai: AiAssistantService) {}

  open(): void {
    this.visible = true;
    if (!this.summary && !this.loading) this.fetch();
  }

  close(): void {
    this.visible = false;
  }

  reload(): void {
    this.summary = null;
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.error = null;
    this.ai.summarizeDiscussion(this.projectId).subscribe({
      next: (s) => { this.summary = s; this.loading = false; },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || "Echec recap IA";
      }
    });
  }
}
