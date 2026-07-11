import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { LanguageService } from 'src/app/core/services/language.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { Project } from 'src/app/shared/models/project.model';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { Role, User } from 'src/app/shared/models/user.model';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-frontoffice-kanban',
  templateUrl: './frontoffice-kanban.component.html',
  styleUrls: ['./frontoffice-kanban.component.css']
})
export class FrontofficeKanbanComponent implements OnInit, OnDestroy {
  private langSub!: Subscription;
  readonly TaskStatus = TaskStatus;
  project: Project | null = null;
  tasks: Task[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  loading = true;
  errorMessage = '';
  selectedTask: Task | null = null;
  showAddModal = false;
  showEditModal = false;
  defaultStatus: TaskStatus = TaskStatus.TODO;

  currentDate = new Date();
  selectedDate = new Date();
  calendarDays: CalendarDay[] = [];

  get weekLabels(): string[] {
    return this.langService.current === 'fr'
      ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  }

  get monthNames(): string[] {
    return this.langService.current === 'fr'
      ? ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
         'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
      : ['January', 'February', 'March', 'April', 'May', 'June',
         'July', 'August', 'September', 'October', 'November', 'December'];
  }

  private get locale(): string {
    return this.langService.current === 'fr' ? 'fr-FR' : 'en-US';
  }

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private taskService: TaskService,
    private userService: UserService,
    private currentUserService: CurrentUserService,
    private langService: LanguageService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.langSub = this.langService.currentLang$.subscribe(() => {
      this.cd.markForCheck();
    });

    const projectId = Number(this.route.snapshot.paramMap.get('id'));

    this.currentUserService.user$.subscribe((user) => {
      this.currentUser = user;
    });

    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }

    this.projectService.getById(projectId).subscribe({
      next: (project) => {
        this.project = project;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger ce projet.';
      }
    });

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
      }
    });

    this.loadTasks(projectId);
  }

  get canManageTasks(): boolean {
    return this.currentUser?.role === Role.SUPER_ADMIN
      || this.currentUser?.role === Role.ADMIN
      || this.currentUser?.role === Role.ORGANIZATION_ADMIN
      || this.currentUser?.role === Role.PROJECT_MANAGER;
  }

  get canCreateTasks(): boolean {
    return this.canManageTasks || this.currentUser?.role === Role.MEMBER;
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter((task) => task.status === TaskStatus.DONE).length;
  }

  get tasksThisMonth(): number {
    return this.tasks.filter((task) => {
      if (!task.dueDate) {
        return false;
      }

      const date = new Date(task.dueDate);
      return date.getMonth() === this.currentDate.getMonth()
        && date.getFullYear() === this.currentDate.getFullYear();
    }).length;
  }

  get progressPercent(): number {
    if (!this.tasks.length) {
      return 0;
    }

    return Math.round((this.completedTasks / this.tasks.length) * 100);
  }

  get calendarTitle(): string {
    return `${this.monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
  }

  get selectedDayTasks(): Task[] {
    return this.tasksForDate(this.selectedDate);
  }

  get upcomingTasks(): Task[] {
    return [...this.tasks]
      .filter((task) => !!task.dueDate && task.status !== TaskStatus.DONE)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }

  get addTaskUsers(): User[] {
    if (this.currentUser?.role === Role.MEMBER && this.currentUser) {
      return [this.currentUser];
    }

    return this.users;
  }

  loadTasks(projectId?: number): void {
    const id = projectId ?? this.project?.id;

    if (!id) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.taskService.getByProject(id).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
        this.buildCalendar();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les taches du projet.';
      }
    });
  }

  buildCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    this.calendarDays = [];

    for (let i = 0; i < firstDayIndex; i++) {
      const date = new Date(year, month, -firstDayIndex + i + 1);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        tasks: []
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        tasks: this.tasksForDate(date)
      });
    }

    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        tasks: []
      });
    }

    const selectedStillVisible = this.calendarDays.some((day) => this.isSameDay(day.date, this.selectedDate));
    if (!selectedStillVisible) {
      this.selectedDate = new Date(year, month, 1);
    }
  }

  tasksForDate(date: Date): Task[] {
    return this.tasks
      .filter((task) => !!task.dueDate && this.isSameDay(new Date(task.dueDate), date))
      .sort((a, b) => this.statusSortValue(a.status) - this.statusSortValue(b.status));
  }

  selectDate(date: Date): void {
    this.selectedDate = new Date(date);
  }

  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.buildCalendar();
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.buildCalendar();
  }

  goToToday(): void {
    const today = new Date();
    this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.selectedDate = today;
    this.buildCalendar();
  }

  openAddModal(status: TaskStatus = TaskStatus.TODO): void {
    if (!this.canCreateTasks) {
      return;
    }

    this.defaultStatus = status;
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onTaskAdded(): void {
    this.closeAddModal();
    this.loadTasks();
  }

  openEditModal(task: Task): void {
    if (!this.canManageTasks) {
      return;
    }

    this.selectedTask = { ...task };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedTask = null;
  }

  onTaskUpdated(): void {
    this.closeEditModal();
    this.loadTasks();
  }

  deleteTask(task: Task): void {
    if (!this.canManageTasks) {
      return;
    }

    if (!confirm(`Supprimer "${task.title}" ?`)) {
      return;
    }

    this.taskService.delete(task.id).subscribe(() => {
      this.loadTasks();
    });
  }

  changeTaskStatus(task: Task, status: TaskStatus): void {
    if (!this.canChangeStatus(task) || task.status === status) {
      return;
    }

    const previousStatus = task.status;
    task.status = status;

    this.taskService.updateStatus(task.id, status).subscribe({
      next: () => {
        this.buildCalendar();
      },
      error: () => {
        task.status = previousStatus;
      }
    });
  }

  getPriorityTone(priority?: string): string {
    switch (priority) {
      case 'HIGH':
        return 'high';
      case 'MEDIUM':
        return 'medium';
      case 'LOW':
        return 'low';
      default:
        return 'neutral';
    }
  }

  getStatusTone(status?: string): string {
    switch (status) {
      case TaskStatus.DONE:
        return 'done';
      case TaskStatus.IN_PROGRESS:
        return 'progress';
      default:
        return 'todo';
    }
  }

  getInitials(task: Task): string {
    const firstName = task.assignedTo?.firstName?.trim()?.[0] ?? '';
    const lastName = task.assignedTo?.lastName?.trim()?.[0] ?? '';
    return `${firstName}${lastName}`.toUpperCase() || '?';
  }

  getAssigneeName(task: Task): string {
    if (!task.assignedTo) {
      return 'Non assigne';
    }

    return `${task.assignedTo.firstName} ${task.assignedTo.lastName}`.trim();
  }

  formatDate(value?: string): string {
    const noDate = this.langService.current === 'fr' ? 'Sans date' : 'No date';
    if (!value) return noDate;
    const date = new Date(value);
    if (isNaN(date.getTime())) return noDate;
    return date.toLocaleDateString(this.locale, {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  formatDayLabel(date: Date): string {
    return date.toLocaleDateString(this.locale, {
      weekday: 'long', day: '2-digit', month: 'long'
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === TaskStatus.DONE) {
      return false;
    }

    return new Date(task.dueDate).getTime() < Date.now();
  }

  isSelected(date: Date): boolean {
    return this.isSameDay(date, this.selectedDate);
  }

  canChangeStatus(task: Task): boolean {
    if (this.canManageTasks) {
      return true;
    }

    return this.currentUser?.role === Role.MEMBER && task.assignedTo?.id === this.currentUser.id;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }

  private statusSortValue(status?: string): number {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 1;
      case TaskStatus.DONE:
        return 2;
      default:
        return 0;
    }
  }
}
