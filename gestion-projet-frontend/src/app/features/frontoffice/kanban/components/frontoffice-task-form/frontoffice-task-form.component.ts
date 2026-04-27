import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-frontoffice-task-form',
  templateUrl: './frontoffice-task-form.component.html',
  styleUrls: ['./frontoffice-task-form.component.css']
})
export class FrontofficeTaskFormComponent implements OnInit {
  @Input() projectId!: number;
  @Input() defaultStatus: TaskStatus = TaskStatus.TODO;
  @Input() users: User[] = [];
  @Input() existingTasks: Task[] = [];
  @Input() hideAssignedUser = false;
  @Input() lockedAssignedUserId: number | null = null;
  @Output() taskAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly statuses = [
    { value: TaskStatus.TODO, label: 'To do' },
    { value: TaskStatus.IN_PROGRESS, label: 'In progress' },
    { value: TaskStatus.DONE, label: 'Done' }
  ];

  task = {
    title: '',
    description: '',
    status: TaskStatus.TODO,
    estimatedHours: null as number | null,
    dueDate: '',
    assignedUserId: null as number | null,
    parentTaskId: null as number | null,
    dependsOnId: null as number | null
  };

  loading = false;
  successMessage = '';
  errorMessage = '';
  readonly today = new Date().toISOString().split('T')[0];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.task.status = this.defaultStatus;
    this.task.assignedUserId = this.lockedAssignedUserId;
  }

  save(): void {
    if (this.loading || !this.hasValidDueDate()) {
      return;
    }

    const assignedUserId = this.lockedAssignedUserId ?? this.task.assignedUserId;
    const payload = {
      title: this.task.title,
      description: this.task.description,
      status: this.task.status,
      estimatedHours: this.task.estimatedHours,
      dueDate: this.task.dueDate || null,
      project: { id: this.projectId },
      assignedTo: assignedUserId ? { id: assignedUserId } : null,
      parentTask: this.task.parentTaskId ? { id: this.task.parentTaskId } : null,
      dependsOn: this.task.dependsOnId ? { id: this.task.dependsOnId } : null
    };

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.taskService.create(payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Tache creee avec succes.';
        setTimeout(() => {
          this.taskAdded.emit();
          this.close.emit();
        }, 700);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Impossible de creer la tache.';
      }
    });
  }

  hasValidDueDate(): boolean {
    return !this.task.dueDate || this.task.dueDate >= this.today;
  }

  get availableParentTasks(): Task[] {
    return this.existingTasks;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ftf-overlay')) {
      this.close.emit();
    }
  }
}
