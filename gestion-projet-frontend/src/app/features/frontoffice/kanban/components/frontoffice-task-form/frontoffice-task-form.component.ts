import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { User } from 'src/app/shared/models/user.model';
import {
  AssigneeSuggestion,
  TaskDescriptionResponse
} from 'src/app/shared/models/ai-assistant.model';

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
    { value: TaskStatus.TODO, label: 'kanban.todo' },
    { value: TaskStatus.IN_PROGRESS, label: 'kanban.inProgress' },
    { value: TaskStatus.DONE, label: 'kanban.done' }
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

  // ---- IA : description generee depuis le titre ----
  onAiDescriptionGenerated(resp: TaskDescriptionResponse): void {
    if (resp.description) {
      let txt = resp.description;
      if (resp.acceptanceCriteria?.length) {
        txt += '\n\nCriteres d\'acceptation :\n' +
          resp.acceptanceCriteria.map(c => '- ' + c).join('\n');
      }
      this.task.description = txt;
    }
    if (resp.estimatedHours) {
      this.task.estimatedHours = resp.estimatedHours;
    }
  }

  // ---- IA : assignee suggere ----
  onAiAssigneePicked(s: AssigneeSuggestion): void {
    this.task.assignedUserId = s.userId;
  }
}
