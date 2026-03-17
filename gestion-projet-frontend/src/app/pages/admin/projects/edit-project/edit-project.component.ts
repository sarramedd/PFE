import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project, ProjectStatus } from 'src/app/models/project';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {

  @Input()  project!: Project;
  @Output() projectUpdated = new EventEmitter<void>();
  @Output() close          = new EventEmitter<void>();

 statuses = [
  { value: ProjectStatus.ACTIVE,    label: 'Active',    css: 'progress'  },
  { value: ProjectStatus.ARCHIVED,  label: 'Archived',  css: 'planned'   },
  { value: ProjectStatus.COMPLETED, label: 'Completed', css: 'completed' }
];

  loading    = false;
  successMsg = '';
  errorMsg   = '';

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    // Clone pour éviter de modifier l'objet parent directement
    this.project = { ...this.project };
  }

  update(): void {
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    this.projectService.update(this.project.id, this.project).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'Project updated successfully!';
        setTimeout(() => {
          this.projectUpdated.emit();
          this.close.emit();
        }, 1000);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'An error occurred. Please try again.';
      }
    });
  }

  cancel(): void {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ep-overlay')) {
      this.close.emit();
    }
  }
}