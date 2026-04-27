import { Component, EventEmitter, Output } from '@angular/core';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { ProjectStatus } from 'src/app/shared/models/project.model';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent {

  @Output() projectAdded = new EventEmitter<void>();
  @Output() close        = new EventEmitter<void>();

  statuses = [
  { value: ProjectStatus.ACTIVE,    label: 'Active',    css: 'progress'  },
  { value: ProjectStatus.ARCHIVED,  label: 'Archived',  css: 'planned'   },
  { value: ProjectStatus.COMPLETED, label: 'Completed', css: 'completed' }
];

project = {
  name        : '',
  description : '',
  startDate   : '',
  endDate     : '',
  status      : ProjectStatus.ACTIVE  // valeur par défaut
};

  loading    = false;
  successMsg = '';
  errorMsg   = '';
  readonly today = new Date().toISOString().split('T')[0];

  constructor(private projectService: ProjectService) {}

  addProject(): void {
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    this.projectService.create(this.project).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'Project created successfully!';
        setTimeout(() => {
          this.projectAdded.emit();
          this.close.emit();
        }, 1000);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'An error occurred. Please try again.';
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ap-overlay')) {
      this.close.emit();
    }
  }

  hasValidDates(): boolean {
    return !this.project.startDate || !this.project.endDate || this.project.endDate >= this.project.startDate;
  }
}
