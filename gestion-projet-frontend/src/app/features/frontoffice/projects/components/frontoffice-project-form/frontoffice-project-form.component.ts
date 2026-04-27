import { Component, EventEmitter, Output } from '@angular/core';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { ProjectStatus } from 'src/app/shared/models/project.model';

@Component({
  selector: 'app-frontoffice-project-form',
  templateUrl: './frontoffice-project-form.component.html',
  styleUrls: ['./frontoffice-project-form.component.css']
})
export class FrontofficeProjectFormComponent {
  @Output() projectAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly statuses = [
    { value: ProjectStatus.ACTIVE, label: 'Active' },
    { value: ProjectStatus.COMPLETED, label: 'Completed' },
    { value: ProjectStatus.ARCHIVED, label: 'Archived' }
  ];

  project = {
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ProjectStatus.ACTIVE
  };

  loading = false;
  successMessage = '';
  errorMessage = '';
  readonly today = new Date().toISOString().split('T')[0];

  constructor(private projectService: ProjectService) {}

  save(): void {
    if (this.loading || !this.hasValidDates()) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.projectService.create(this.project).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Projet cree avec succes.';
        setTimeout(() => {
          this.projectAdded.emit();
          this.close.emit();
        }, 700);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Impossible de creer le projet.';
      }
    });
  }

  hasValidDates(): boolean {
    return !this.project.startDate || !this.project.endDate || this.project.endDate >= this.project.startDate;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fpf-overlay')) {
      this.close.emit();
    }
  }
}
