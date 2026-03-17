import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/models/user';
import { TaskService } from 'src/app/services/task.service';
import { TaskStatus } from 'src/app/models/task';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css']
})
export class AddTaskComponent {

  @Input()  projectId!: number;
  @Input()  defaultStatus: TaskStatus = TaskStatus.TODO;
  @Input()  users: User[] = [];
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

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.task.projectId = this.projectId;
    this.task.status    = this.defaultStatus;
  }

  addTask(): void {
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    const payload: any = {
    title:       this.task.title,
    description: this.task.description,
    status:      this.task.status,
    dueDate:     this.task.dueDate || null,
    project:     { id: this.projectId },
    assignedTo:  this.task.assignedUserId ? { id: this.task.assignedUserId } : null
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
}