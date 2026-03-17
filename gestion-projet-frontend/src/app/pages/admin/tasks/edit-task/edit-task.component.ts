import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Task } from 'src/app/models/task';
import { User } from 'src/app/models/user';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.css']
})
export class EditTaskComponent implements OnInit {

  @Input()  task!: Task;
  @Input()  users: User[] = [];
  @Output() taskUpdated = new EventEmitter<void>();
  @Output() close       = new EventEmitter<void>();

  statuses = [
    { value: 'TODO',        label: 'To Do',       css: 'todo'     },
    { value: 'IN_PROGRESS', label: 'In Progress',  css: 'progress' },
    { value: 'DONE',        label: 'Done',         css: 'done'     }
  ];

  editTask: any = {};
  loading    = false;
  successMsg = '';
  errorMsg   = '';

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.editTask = {
      title          : this.task.title,
      description    : this.task.description ?? '',
      status         : this.task.status,
      dueDate        : this.task.dueDate ?? '',
      projectId      : this.task.projectId,
      assignedUserId : this.task.assignedUserId ?? null
    };
  }

  update(): void {
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    const payload = { ...this.editTask, dueDate: this.editTask.dueDate || null };

    this.taskService.update(this.task.id, payload).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'Task updated!';
        setTimeout(() => { this.taskUpdated.emit(); this.close.emit(); }, 800);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'Failed to update task.';
      }
    });
  }

  cancel(): void { this.close.emit(); }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('et-overlay')) {
      this.close.emit();
    }
  }
}