import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { TaskStatus } from 'src/app/shared/models/task.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent {

  @Input()  projectId!: number;
  @Input()  defaultStatus: TaskStatus = TaskStatus.TODO;
  @Input()  users: User[] = [];
  @Input()  hideAssignedUser = false;
  @Input()  lockedAssignedUserId: number | null = null;
  @Output() taskAdded = new EventEmitter<void>();
  @Output() close     = new EventEmitter<void>();

  statuses = [
    { value: 'TODO',        label: 'To Do',       css: 'todo'     },
    { value: 'IN_PROGRESS', label: 'In Progress',  css: 'progress' },
    { value: 'DONE',        label: 'Done',         css: 'done'     }
  ];

  task = {
    title          : '',
    description    : '',
    status         : 'TODO',
    dueDate        : '',
    projectId      : 0,
    assignedUserId : null as number | null
  };

  loading    = false;
  successMsg = '';
  errorMsg   = '';
  readonly today = new Date().toISOString().split('T')[0];

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.task.projectId = this.projectId;
    this.task.status    = this.defaultStatus;
    this.task.assignedUserId = this.lockedAssignedUserId;
  }

  addTask(): void {
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    const assignedUserId = this.lockedAssignedUserId ?? this.task.assignedUserId;

    const payload: any = {
      title:       this.task.title,
      description: this.task.description,
      status:      this.task.status,
      dueDate:     this.task.dueDate || null,
      project:     { id: this.projectId },
      assignedTo:  assignedUserId ? { id: assignedUserId } : null
    };

    this.taskService.create(payload).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'Task created!';
        setTimeout(() => { this.taskAdded.emit(); this.close.emit(); }, 800);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'Failed to create task.';
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('at-overlay')) {
      this.close.emit();
    }
  }

  hasValidDueDate(): boolean {
    return !this.task.dueDate || this.task.dueDate >= this.today;
  }
}
