import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { Project } from 'src/app/shared/models/project.model';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { Role, User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-kanban',
  templateUrl: './kanban.component.html',
  styleUrls: ['./kanban.component.css']
})
export class KanbanComponent implements OnInit {

  project: Project | null = null;
  tasks: Task[]  = [];
  users: User[]  = [];
  currentUser: User | null = null;
  area: 'admin' | 'frontoffice' = 'admin';

  // ── View toggle ────────────────────────────────────────────────
  viewMode: 'kanban' | 'calendar' = 'kanban';
  calendarView: 'month' | 'week'  = 'month';

  // ── Calendar state ─────────────────────────────────────────────
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  weekDays: CalendarDay[]     = [];
  readonly WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  readonly MONTH_NAMES = ['January','February','March','April','May','June',
                          'July','August','September','October','November','December'];

  // ── Kanban columns ─────────────────────────────────────────────
  columns = [
    { status: TaskStatus.TODO,        label: 'To Do',       icon: 'todo',     color: '#64748b' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: 'progress', color: '#0ea5e9' },
    { status: TaskStatus.DONE,        label: 'Done',        icon: 'done',     color: '#10b981' }
  ];

  // ── Modals ─────────────────────────────────────────────────────
  showAddModal    = false;
  showEditModal   = false;
  selectedTask: Task | null = null;
  defaultStatus: TaskStatus = TaskStatus.TODO;

  // ── Drag ───────────────────────────────────────────────────────
  draggedTask: Task | null = null;

  constructor(
    private route: ActivatedRoute,
    private taskService: TaskService,
    private userService: UserService,
    private projectService: ProjectService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    const projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.area = this.route.snapshot.routeConfig?.path?.startsWith('frontoffice') ? 'frontoffice' : 'admin';
    this.projectService.getById(projectId).subscribe(p => this.project = p);
    this.userService.getAll().subscribe(u => this.users = u);
    this.currentUserService.user$.subscribe(user => this.currentUser = user);
    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }
    this.loadTasks(projectId);
  }

  get canManageTasks(): boolean {
    return this.currentUser?.role === Role.SUPER_ADMIN
      || this.currentUser?.role === Role.ADMIN
      || this.currentUser?.role === Role.ORGANIZATION_ADMIN
      || this.currentUser?.role === Role.PROJECT_MANAGER;
  }

  get backLink(): string {
    return this.area === 'frontoffice' ? '/frontoffice/projects' : '/admin/projects';
  }

  loadTasks(projectId?: number): void {
    const id = projectId ?? this.project?.id;
    if (!id) return;
    this.taskService.getByProject(id).subscribe(data => {
      this.tasks = data;
      this.buildCalendar();
    });
  }

  // ── View toggle ────────────────────────────────────────────────
  setView(mode: 'kanban' | 'calendar'): void {
    this.viewMode = mode;
    if (mode === 'calendar') this.buildCalendar();
  }

  setCalendarView(view: 'month' | 'week'): void {
    this.calendarView = view;
    this.buildCalendar();
  }

  // ── Calendar builders ──────────────────────────────────────────
  buildCalendar(): void {
    if (this.calendarView === 'month') this.buildMonth();
    else this.buildWeek();
  }

  buildMonth(): void {
    const year  = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    this.calendarDays = [];

    // Padding before
    for (let i = 0; i < firstDay; i++) {
      const d = new Date(year, month, -firstDay + i + 1);
      this.calendarDays.push({ date: d, isCurrentMonth: false, isToday: false, tasks: [] });
    }

    // Days of month
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        tasks: this.getTasksForDay(date)
      });
    }

    // Padding after (fill to 42 cells = 6 rows)
    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({ date, isCurrentMonth: false, isToday: false, tasks: [] });
    }
  }

  buildWeek(): void {
    const startOfWeek = new Date(this.currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    const today = new Date();

    this.weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        tasks: this.getTasksForDay(date)
      });
    }
  }

  getTasksForDay(date: Date): Task[] {
    return this.tasks.filter(t => {
      if (!t.dueDate) return false;
      return this.isSameDay(new Date(t.dueDate), date);
    });
  }

  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
  }

  // ── Calendar navigation ────────────────────────────────────────
  prev(): void {
    if (this.calendarView === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    } else {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() - 7);
      this.currentDate = d;
    }
    this.buildCalendar();
  }

  next(): void {
    if (this.calendarView === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    } else {
      const d = new Date(this.currentDate);
      d.setDate(d.getDate() + 7);
      this.currentDate = d;
    }
    this.buildCalendar();
  }

  goToToday(): void {
    this.currentDate = new Date();
    this.buildCalendar();
  }

  get calendarTitle(): string {
    if (this.calendarView === 'month') {
      return `${this.MONTH_NAMES[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }
    if (this.weekDays.length === 0) return '';
    const start = this.weekDays[0].date;
    const end   = this.weekDays[6].date;
    return `${start.getDate()} ${this.MONTH_NAMES[start.getMonth()]} – ${end.getDate()} ${this.MONTH_NAMES[end.getMonth()]} ${end.getFullYear()}`;
  }

  // ── Task status class ──────────────────────────────────────────
  getTaskStatusClass(status: string): string {
    const map: Record<string, string> = {
      TODO:        'cal-task-todo',
      IN_PROGRESS: 'cal-task-progress',
      DONE:        'cal-task-done'
    };
    return map[status] ?? '';
  }

  // ── Kanban helpers ─────────────────────────────────────────────
  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(t => t.status === status);
  }

  getColumnCount(status: string): number {
    return this.getTasksByStatus(status).length;
  }

  get todoCount():       number { return this.getColumnCount(TaskStatus.TODO); }
  get inProgressCount(): number { return this.getColumnCount(TaskStatus.IN_PROGRESS); }
  get doneCount():       number { return this.getColumnCount(TaskStatus.DONE); }
  get totalCount():      number { return this.tasks.length; }
  get progressPercent(): number {
    if (!this.totalCount) return 0;
    return Math.round((this.doneCount / this.totalCount) * 100);
  }

  onDragStart(task: Task): void { this.draggedTask = task; }
  onDragOver(event: DragEvent): void { event.preventDefault(); }

  onDrop(event: DragEvent, status: string): void {
    event.preventDefault();
    if (!this.canManageTasks) return;
    if (!this.draggedTask || this.draggedTask.status === status) return;
    const oldStatus = this.draggedTask.status;
    this.draggedTask.status = status;
    this.taskService.updateStatus(this.draggedTask.id, status).subscribe({
      error: () => { if (this.draggedTask) this.draggedTask.status = oldStatus; }
    });
    this.draggedTask = null;
  }

  // ── Modals ─────────────────────────────────────────────────────
  openAddModal(status: TaskStatus = TaskStatus.TODO): void {
    if (!this.canManageTasks) return;
    this.defaultStatus = status;
    this.showAddModal  = true;
  }
  closeAddModal(): void { this.showAddModal = false; }

  openEditModal(task: Task, event?: Event): void {
    event?.stopPropagation();
    if (!this.canManageTasks) return;
    this.selectedTask  = { ...task };
    this.showEditModal = true;
  }
  closeEditModal(): void { this.showEditModal = false; this.selectedTask = null; }

  onTaskAdded():   void { this.closeAddModal();  this.loadTasks(); }
  onTaskUpdated(): void { this.closeEditModal(); this.loadTasks(); }

  deleteTask(task: Task, event?: Event): void {
    event?.stopPropagation();
    if (!this.canManageTasks) return;
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.delete(task.id).subscribe(() => this.loadTasks());
  }

  getUserInitials(task: Task): string {
    const u = task.assignedTo;
    if (!u) return '?';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase();
  }

  isDueSoon(dateStr?: string): boolean {
    if (!dateStr) return false;
    const diff = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  }

  isOverdue(dateStr?: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}
