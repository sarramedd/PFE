import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { TaskWorklogService } from 'src/app/core/services/task-worklog.service';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { User } from 'src/app/shared/models/user.model';

type StatusFilter = 'ALL' | TaskStatus;
type DueFilter = 'ALL' | 'OVERDUE' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'NO_DATE';

@Component({
  selector: 'app-frontoffice-tasks',
  templateUrl: './frontoffice-tasks.component.html',
  styleUrls: ['./frontoffice-tasks.component.css']
})
export class FrontofficeTasksComponent implements OnInit, OnDestroy {
  readonly TaskStatus = TaskStatus;
  currentUser: User | null = null;
  tasks: Task[] = [];
  loading = true;
  errorMessage = '';
  statusFilter: StatusFilter = 'ALL';
  dueFilter: DueFilter = 'ALL';
  selectedTask: Task | null = null;
  timerTaskId: number | null = null;
  timerElapsedSeconds = 0;
  timerInterval: ReturnType<typeof setInterval> | null = null;
  timerBusy = false;
  activeTaskSummary: Record<string, unknown> | null = null;

  constructor(
    private currentUserService: CurrentUserService,
    private taskService: TaskService,
    private taskWorklogService: TaskWorklogService
  ) {}

  ngOnInit(): void {
    this.currentUserService.user$.subscribe((user) => {
      this.currentUser = user;

      if (user?.id) {
        this.loadTasks(user.id);
        this.loadActiveTimer();
      } else {
        this.loading = false;
      }
    });

    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }
  }

  ngOnDestroy(): void {
    this.clearTimerInterval();
  }

  loadTasks(userId: number): void {
    this.loading = true;
    this.errorMessage = '';

    this.taskService.getByUser(userId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les taches.';
      }
    });
  }

  loadActiveTimer(): void {
    this.taskWorklogService.getActiveTimer().subscribe({
      next: (state) => {
        if (state?.['running']) {
          this.timerTaskId = Number(state['taskId']);
          this.timerElapsedSeconds = Number(state['elapsedSeconds'] || 0);
          this.startTimerInterval();
          this.loadTaskSummary(this.timerTaskId);
        } else {
          this.timerTaskId = null;
          this.timerElapsedSeconds = 0;
          this.activeTaskSummary = null;
          this.clearTimerInterval();
        }
      }
    });
  }

  get filteredTasks(): Task[] {
    return this.tasks
      .filter((task) => this.matchesStatusFilter(task) && this.matchesDueFilter(task))
      .map((task) => ({
        ...task,
        subtasks: this.tasks.filter((child) => child.parentTask?.id === task.id)
      }));
  }

  setStatusFilter(filter: StatusFilter): void {
    this.statusFilter = filter;
  }

  setDueFilter(filter: DueFilter): void {
    this.dueFilter = filter;
  }

  resetFilters(): void {
    this.statusFilter = 'ALL';
    this.dueFilter = 'ALL';
  }

  openTask(task: Task): void {
    this.selectedTask = task;
  }

  closeTaskHub(): void {
    this.selectedTask = null;
  }

  startTaskTimer(task: Task): void {
    if (!task.id || this.timerBusy) {
      return;
    }

    this.timerBusy = true;
    this.taskWorklogService.startTimer(task.id).subscribe({
      next: () => {
        this.timerTaskId = task.id;
        this.timerElapsedSeconds = 0;
        this.startTimerInterval();
        this.loadTaskSummary(task.id!);
        this.timerBusy = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Impossible de demarrer le timer.';
        this.timerBusy = false;
      }
    });
  }

  stopTaskTimer(): void {
    if (!this.timerTaskId || this.timerBusy) {
      return;
    }

    this.timerBusy = true;
    this.taskWorklogService.stopTimer().subscribe({
      next: () => {
        this.timerTaskId = null;
        this.timerElapsedSeconds = 0;
        this.activeTaskSummary = null;
        this.clearTimerInterval();
        if (this.currentUser?.id) {
          this.loadTasks(this.currentUser.id);
        }
        this.timerBusy = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Impossible d arreter le timer.';
        this.timerBusy = false;
      }
    });
  }

  isTimerRunningOn(taskId?: number): boolean {
    return !!taskId && this.timerTaskId === taskId;
  }

  get formattedElapsed(): string {
    const hours = Math.floor(this.timerElapsedSeconds / 3600);
    const minutes = Math.floor((this.timerElapsedSeconds % 3600) / 60);
    const seconds = this.timerElapsedSeconds % 60;
    return `${this.pad(hours)}:${this.pad(minutes)}:${this.pad(seconds)}`;
  }

  getPriorityClass(priority?: string): string {
    switch (priority) {
      case 'HIGH':
        return 'bg-label-danger';
      case 'MEDIUM':
        return 'bg-label-warning';
      case 'LOW':
        return 'bg-label-success';
      default:
        return 'bg-label-secondary';
    }
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Aucune echeance';
    }

    const date = new Date(value);
    return isNaN(date.getTime())
      ? 'Aucune echeance'
      : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === TaskStatus.DONE) {
      return false;
    }

    const today = new Date();
    const currentDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dueDate = new Date(task.dueDate);
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
    return dueDay.getTime() < currentDay.getTime();
  }

  getTaskLoad(task: Task): string {
    return `${task.estimatedHours || 0}h`;
  }

  private loadTaskSummary(taskId: number): void {
    this.taskWorklogService.getTaskSummary(taskId).subscribe({
      next: (summary) => {
        this.activeTaskSummary = summary;
      },
      error: () => {
        this.activeTaskSummary = null;
      }
    });
  }

  private startTimerInterval(): void {
    this.clearTimerInterval();
    this.timerInterval = setInterval(() => {
      this.timerElapsedSeconds += 1;
    }, 1000);
  }

  private clearTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private pad(value: number): string {
    return value.toString().padStart(2, '0');
  }

  private matchesStatusFilter(task: Task): boolean {
    if (this.statusFilter === 'ALL') {
      return true;
    }

    return task.status === this.statusFilter;
  }

  private matchesDueFilter(task: Task): boolean {
    if (this.dueFilter === 'ALL') {
      return true;
    }

    if (!task.dueDate) {
      return this.dueFilter === 'NO_DATE';
    }

    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

    if (this.dueFilter === 'OVERDUE') {
      return dueDay.getTime() < today.getTime() && task.status !== TaskStatus.DONE;
    }

    if (this.dueFilter === 'TODAY') {
      return this.isSameDay(dueDay, today);
    }

    if (this.dueFilter === 'THIS_WEEK') {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return dueDay.getTime() >= startOfWeek.getTime() && dueDay.getTime() <= endOfWeek.getTime();
    }

    if (this.dueFilter === 'THIS_MONTH') {
      return dueDay.getMonth() === today.getMonth() && dueDay.getFullYear() === today.getFullYear();
    }

    return false;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
}
