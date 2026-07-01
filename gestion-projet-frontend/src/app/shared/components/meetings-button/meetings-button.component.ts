import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MeetingsPanelComponent } from '../meetings-panel/meetings-panel.component';

/**
 * Bouton "Reunions" qui ouvre une modale plein ecran avec le panneau
 * de gestion des reunions du projet.
 *
 * Usage : <app-meetings-button [projectId]="project.id"></app-meetings-button>
 *
 * Composant standalone : a ajouter dans les imports du parent ou du module.
 */
@Component({
  selector: 'app-meetings-button',
  standalone: true,
  imports: [CommonModule, MeetingsPanelComponent],
  template: `
    <button type="button" class="mb-trigger" (click)="open()">
      <span class="mb-icon">&#128197;</span>
      Reunions
    </button>

    <div *ngIf="visible" class="mb-overlay" (click)="close()">
      <div class="mb-modal" (click)="$event.stopPropagation()">
        <header class="mb-modal__head">
          <h3>Reunions du projet</h3>
          <button type="button" class="mb-close" (click)="close()" aria-label="Fermer">&times;</button>
        </header>
        <div class="mb-modal__body">
          <app-meetings-panel [projectId]="projectId"></app-meetings-panel>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mb-trigger {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 14px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%);
      color: #fff; font-weight: 600; font-size: 13px; cursor: pointer;
      box-shadow: 0 2px 6px rgba(29, 78, 216, 0.25);
      transition: transform .15s ease, box-shadow .15s ease;
    }
    .mb-trigger:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 10px rgba(29, 78, 216, 0.35);
    }
    .mb-icon { font-size: 15px; }

    .mb-overlay {
      position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55);
      display: flex; align-items: center; justify-content: center;
      z-index: 9999; padding: 20px;
    }
    .mb-modal {
      background: #fff; border-radius: 14px;
      width: 100%; max-width: 860px; max-height: 90vh;
      display: flex; flex-direction: column; overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .mb-modal__head {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 22px; border-bottom: 1px solid #e5e7eb;
      background: linear-gradient(135deg, #EFF6FF 0%, #EDE9FE 100%);
    }
    .mb-modal__head h3 { margin: 0; font-size: 18px; color: #1F2937; }
    .mb-close {
      background: none; border: none; font-size: 28px;
      cursor: pointer; color: #4B5563; line-height: 1;
    }
    .mb-close:hover { color: #111827; }
    .mb-modal__body { padding: 18px 22px; overflow-y: auto; }
  `]
})
export class MeetingsButtonComponent {
  @Input({ required: true }) projectId!: number;

  visible = false;

  open(): void { this.visible = true; }
  close(): void { this.visible = false; }
}
