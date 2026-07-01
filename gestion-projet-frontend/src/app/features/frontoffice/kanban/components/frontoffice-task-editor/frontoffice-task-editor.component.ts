import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-frontoffice-task-editor',
  templateUrl: './frontoffice-task-editor.component.html',
  styleUrls: ['./frontoffice-task-editor.component.css']
})
export class FrontofficeTaskEditorComponent implements OnInit {
  @Input() task!: Task;
  @Input() users: User[] = [];
  @Input() existingTasks: Task[] = [];
  @Input() canManageTasks = false;
  @Output() taskUpdated = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  readonly statuses = [
    { value: TaskStatus.TODO, label: 'kanban.todo' },
    { value: TaskStatus.IN_PROGRESS, label: 'kanban.inProgress' },
    { value: TaskStatus.DONE, label: 'kanban.done' }
  ];

  form = {
    title: '',
    description: '',
    status: TaskStatus.TODO,
    dueDate: '',
    estimatedHours: null as number | null,
    assignedUserId: null as number | null,
    parentTaskId: null as number | null,
    dependsOnId: null as number | null
  };

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.form = {
      title: this.task.title,
      description: this.task.description || '',
      status: (this.task.status as TaskStatus) || TaskStatus.TODO,
      dueDate: this.task.dueDate || '',
      estimatedHours: this.task.estimatedHours ?? null,
      assignedUserId: this.task.assignedTo?.id ?? null,
      parentTaskId: this.task.parentTask?.id ?? null,
      dependsOnId: this.task.dependsOn?.id ?? null
    };
  }

  save(): void {
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      title: this.form.title,
      description: this.form.description,
      status: this.form.status,
      dueDate: this.form.dueDate || null,
      estimatedHours: this.form.estimatedHours,
      project: { id: this.task.project?.id ?? this.task.projectId },
      assignedTo: this.form.assignedUserId ? { id: this.form.assignedUserId } : null,
      parentTask: this.form.parentTaskId ? { id: this.form.parentTaskId } : null,
      dependsOn: this.form.dependsOnId ? { id: this.form.dependsOnId } : null
    };

    this.taskService.update(this.task.id, payload).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Tache mise a jour.';
        setTimeout(() => {
          this.taskUpdated.emit();
          this.close.emit();
        }, 500);
      },
      error: (error: any) => {
        this.loading = false;
        this.errorMessage = error?.error?.message ?? 'Impossible de mettre a jour la tache.';
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('fte-overlay')) {
      this.close.emit();
    }
  }

  get availableTasks(): Task[] {
    return this.existingTasks.filter((item) => item.id !== this.task.id);
  }
}
