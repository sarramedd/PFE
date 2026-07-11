import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { LanguageService } from 'src/app/core/services/language.service';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { NotificationItem } from 'src/app/shared/models/notification.model';
import { Project } from 'src/app/shared/models/project.model';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { Role, User } from 'src/app/shared/models/user.model';

interface ProjectProgressItem {
  project: Project;
  total: number;
  done: number;
  progress: number;
  delayed: number;
}

interface AiInsight {
  title: string;
  description: string;
  tone: 'danger' | 'warning' | 'success' | 'info';
}

interface DashboardBar {
  label: string;
  value: number;
  percent: number;
  tone: string;
}

interface MemberWorkloadItem {
  userId: number;
  name: string;
  total: number;
  overdue: number;
  done: number;
  hours: number;
}

@Component({
  selector: 'app-frontoffice-dashboard',
  templateUrl: './frontoffice-dashboard.component.html',
  styleUrls: ['./frontoffice-dashboard.component.css']
})
export class FrontofficeDashboardComponent implements OnInit, OnDestroy {
  readonly TaskStatus = TaskStatus;
  readonly Role = Role;

  currentUser: User | null = null;
  projects: Project[] = [];
  myTasks: Task[] = [];
  projectTasks: Task[] = [];
  notifications: NotificationItem[] = [];
  loading = true;
  errorMessage = '';
  private notificationsSub: Subscription | null = null;

  constructor(
    private lang: LanguageService,
    private currentUserService: CurrentUserService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    const snapshot = this.currentUserService.snapshot;

    if (snapshot) {
      this.currentUser = snapshot;
      this.loadDashboard(snapshot);
      return;
    }

    this.currentUserService.refresh().subscribe({
      next: (user) => {
        if (!user) {
          this.loading = false;
          this.errorMessage = this.lang.instant('dashboard.sessionError');
          return;
        }

        this.currentUser = user;
        this.loadDashboard(user);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.lang.instant('dashboard.dashboardError');
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationsSub?.unsubscribe();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'dashboard.greetingMorning';
    if (hour < 18) return 'dashboard.greetingAfternoon';
    return 'dashboard.greetingEvening';
  }

  get activeProjectsCount(): number {
    return this.projects.filter((project) => project.status !== 'ARCHIVED').length;
  }

  get isProjectManagerView(): boolean {
    return this.currentUser?.role === Role.PROJECT_MANAGER;
  }

  get dashboardTasks(): Task[] {
    return this.isProjectManagerView ? this.projectTasks : this.myTasks;
  }

  get todayTasksCount(): number {
    return this.dashboardTasksDueToday.length;
  }

  get overdueTasksCount(): number {
    return this.dashboardOverdueTasks.length;
  }

  get unreadNotificationsCount(): number {
    return this.notifications.filter((item) => !item.isRead).length;
  }

  get completedTasksCount(): number {
    return this.dashboardTasks.filter((task) => task.status === TaskStatus.DONE).length;
  }

  get completionPercent(): number {
    return this.dashboardTasks.length ? Math.round((this.completedTasksCount / this.dashboardTasks.length) * 100) : 0;
  }

  get statusBars(): DashboardBar[] {
    const total = this.dashboardTasks.length || 1;
    const todo = this.dashboardTasks.filter((task) => task.status === TaskStatus.TODO).length;
    const inProgress = this.dashboardTasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
    const done = this.dashboardTasks.filter((task) => task.status === TaskStatus.DONE).length;

    return [
      { label: 'common.todo', value: todo, percent: Math.round((todo / total) * 100), tone: 'violet' },
      { label: 'common.inProgress', value: inProgress, percent: Math.round((inProgress / total) * 100), tone: 'sky' },
      { label: 'common.done', value: done, percent: Math.round((done / total) * 100), tone: 'mint' }
    ];
  }

  get deadlineBars(): DashboardBar[] {
    const total = this.dashboardTasks.length || 1;
    const overdue = this.dashboardOverdueTasks.length;
    const today = this.dashboardTasksDueToday.length;
    const week = this.dashboardTasks.filter((task) => this.isTaskInCurrentWeek(task)).length;
    const month = this.dashboardTasks.filter((task) => this.isTaskInCurrentMonth(task)).length;

    return [
      { label: 'dashboard.overdue', value: overdue, percent: Math.round((overdue / total) * 100), tone: 'rose' },
      { label: 'dashboard.today', value: today, percent: Math.round((today / total) * 100), tone: 'amber' },
      { label: 'dashboard.thisWeek', value: week, percent: Math.round((week / total) * 100), tone: 'sky' },
      { label: 'dashboard.thisMonth', value: month, percent: Math.round((month / total) * 100), tone: 'mint' }
    ];
  }

  get completionRing(): string {
    const percent = this.completionPercent;
    return `conic-gradient(#8d95ff 0% ${percent}%, #eef2fb ${percent}% 100%)`;
  }

  get tasksDueToday(): Task[] {
    const today = this.startOfDay(new Date());
    return this.myTasks.filter((task) => task.dueDate && this.isSameDay(new Date(task.dueDate), today));
  }

  get overdueTasks(): Task[] {
    const today = this.startOfDay(new Date());
    return this.myTasks.filter((task) => this.isTaskOverdue(task, today));
  }

  get dashboardTasksDueToday(): Task[] {
    const today = this.startOfDay(new Date());
    return this.dashboardTasks.filter((task) => task.dueDate && this.isSameDay(new Date(task.dueDate), today));
  }

  get dashboardOverdueTasks(): Task[] {
    const today = this.startOfDay(new Date());
    return this.dashboardTasks.filter((task) => this.isTaskOverdue(task, today));
  }

  get upcomingTasks(): Task[] {
    return [...this.dashboardTasks]
      .filter((task) => task.dueDate && task.status !== TaskStatus.DONE)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }

  get teamLateTasks(): Task[] {
    return [...this.projectTasks]
      .filter((task) => this.isTaskOverdue(task))
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
      .slice(0, 5);
  }

  get recentNotifications(): NotificationItem[] {
    return [...this.notifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }

  get projectProgress(): ProjectProgressItem[] {
    return this.projects
      .map((project) => {
        const tasks = this.projectTasks.filter((task) => task.project?.id === project.id || task.projectId === project.id);
        const total = tasks.length;
        const done = tasks.filter((task) => task.status === TaskStatus.DONE).length;
        const delayed = tasks.filter((task) => this.isTaskOverdue(task)).length;
        return {
          project,
          total,
          done,
          delayed,
          progress: total ? Math.round((done / total) * 100) : 0
        };
      })
      .sort((a, b) => b.delayed - a.delayed || b.total - a.total)
      .slice(0, 4);
  }

  get aiInsights(): AiInsight[] {
    const insights: AiInsight[] = [];
    const overdue = this.dashboardOverdueTasks.length;
    const dueSoon = this.dashboardTasks.filter((task) => this.isTaskDueSoon(task)).length;
    const riskyProject = this.projectProgress.find((item) => item.delayed > 0 || (item.total >= 3 && item.progress < 40));

    if (overdue > 0) {
      insights.push({
        title: this.lang.instant('dashboard.aiDelayActive'),
        description: `${overdue} ${this.lang.instant(overdue > 1 ? 'dashboard.aiDelayDescPlural' : 'dashboard.aiDelayDesc1')}`,
        tone: 'danger'
      });
    }

    if (dueSoon > 0) {
      insights.push({
        title: this.lang.instant('dashboard.aiUpcoming'),
        description: `${dueSoon} ${this.lang.instant(dueSoon > 1 ? 'dashboard.aiUpcomingDescPlural' : 'dashboard.aiUpcomingDesc1')}`,
        tone: 'warning'
      });
    }

    if (riskyProject) {
      insights.push({
        title: this.lang.instant('dashboard.aiRiskyProject'),
        description: `${riskyProject.project.name}: ${riskyProject.delayed} ${this.lang.instant('dashboard.delayed')}, ${riskyProject.progress}% ${this.lang.instant('dashboard.progressOf')}`,
        tone: riskyProject.delayed > 0 ? 'warning' : 'info'
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: this.lang.instant('dashboard.aiHealthy'),
        description: this.lang.instant('dashboard.aiHealthyDesc'),
        tone: 'success'
      });
    }

    return insights.slice(0, 3);
  }

  taskFilter: 'all' | 'todo' | 'progress' | 'late' = 'all';

  setTaskFilter(f: 'all' | 'todo' | 'progress' | 'late'): void {
    this.taskFilter = f;
  }

  get filteredUpcomingTasks(): Task[] {
    const now = new Date();
    switch (this.taskFilter) {
      case 'todo':     return this.upcomingTasks.filter(t => t.status === TaskStatus.TODO);
      case 'progress': return this.upcomingTasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
      case 'late':     return this.upcomingTasks.filter(t => t.dueDate && new Date(t.dueDate) < now);
      default:         return this.upcomingTasks;
    }
  }

  get quickActions(): Array<{ label: string; route: string; icon: string; tone: string }> {
    return [
      { label: 'nav.projects', route: '/frontoffice/projects', icon: 'bx bx-briefcase-alt-2', tone: 'lilac' },
      { label: 'nav.tasks', route: '/frontoffice/tasks', icon: 'bx bx-task', tone: 'sky' },
      { label: 'nav.messages', route: '/frontoffice/messages', icon: 'bx bx-message-dots', tone: 'peach' },
      { label: 'nav.profile', route: '/frontoffice/profile', icon: 'bx bx-user-circle', tone: 'mint' }
    ];
  }

  get uniqueContributorsCount(): number {
    return new Set(
      this.projectTasks
        .filter((task) => !!task.assignedTo?.id)
        .map((task) => task.assignedTo!.id)
    ).size;
  }

  get managerSummaryItems(): Array<{ value: number; label: string }> {
    return [
      { value: this.projectTasks.length, label: 'dashboard.teamTasks' },
      { value: this.completedTasksCount, label: 'dashboard.teamDone' },
      { value: this.overdueTasksCount, label: 'dashboard.teamDelaysLabel' },
      { value: this.uniqueContributorsCount, label: 'dashboard.activeMembers' }
    ];
  }

  get memberWorkload(): MemberWorkloadItem[] {
    const map = new Map<number, MemberWorkloadItem>();

    this.projectTasks.forEach((task) => {
      const assignedUser = task.assignedTo;
      if (!assignedUser?.id) {
        return;
      }

      const current = map.get(assignedUser.id) ?? {
        userId: assignedUser.id,
        name: `${assignedUser.firstName} ${assignedUser.lastName}`.trim(),
        total: 0,
        overdue: 0,
        done: 0,
        hours: 0
      };

      current.total += 1;
      current.hours += task.estimatedHours || 0;

      if (task.status === TaskStatus.DONE) {
        current.done += 1;
      }

      if (this.isTaskOverdue(task)) {
        current.overdue += 1;
      }

      map.set(assignedUser.id, current);
    });

    return [...map.values()]
      .sort((a, b) => b.overdue - a.overdue || b.hours - a.hours || b.total - a.total)
      .slice(0, 6);
  }

  formatDate(value?: string): string {
    if (!value) return this.lang.instant('dashboard.noDate');
    const date = new Date(value);
    if (isNaN(date.getTime())) return this.lang.instant('dashboard.noDate');
    const locale = this.lang.current === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getTaskStatusLabel(status: string): string {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return this.lang.instant('common.inProgress');
      case TaskStatus.DONE:        return this.lang.instant('common.done');
      default:                     return this.lang.instant('common.todo');
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 'progress';
      case TaskStatus.DONE:
        return 'done';
      default:
        return 'todo';
    }
  }

  getInsightClass(tone: AiInsight['tone']): string {
    return `insight-${tone}`;
  }

  private loadDashboard(user: User): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      projects: this.projectService.getMine(),
      myTasks: this.taskService.getByUser(user.id)
    })
      .pipe(
        switchMap(({ projects, myTasks }) => {
          this.projects = projects;
          this.myTasks = myTasks;

          if (!projects.length) {
            return of([]);
          }

          return forkJoin(projects.map((project) => this.taskService.getByProject(project.id)));
        })
      )
      .subscribe({
        next: (projectTaskGroups) => {
          this.projectTasks = projectTaskGroups.flat();
          this.bindLiveNotifications();
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.errorMessage = 'Impossible de charger les donnees du dashboard.';
        }
      });
  }

  private bindLiveNotifications(): void {
    this.notificationsSub?.unsubscribe();
    this.notificationsSub = this.notificationService.watchMineLive().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
      }
    });
  }

  private isTaskOverdue(task: Task, currentDay = this.startOfDay(new Date())): boolean {
    if (!task.dueDate || task.status === TaskStatus.DONE) {
      return false;
    }

    const dueDate = this.startOfDay(new Date(task.dueDate));
    return dueDate.getTime() < currentDay.getTime();
  }

  private isTaskDueSoon(task: Task): boolean {
    if (!task.dueDate || task.status === TaskStatus.DONE) {
      return false;
    }

    const now = new Date();
    const due = new Date(task.dueDate);
    const diff = due.getTime() - now.getTime();
    return diff >= 0 && diff <= 48 * 60 * 60 * 1000;
  }

  private isTaskInCurrentWeek(task: Task): boolean {
    if (!task.dueDate) {
      return false;
    }

    const today = this.startOfDay(new Date());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const due = this.startOfDay(new Date(task.dueDate));
    return due.getTime() >= startOfWeek.getTime() && due.getTime() <= endOfWeek.getTime();
  }

  private isTaskInCurrentMonth(task: Task): boolean {
    if (!task.dueDate) {
      return false;
    }

    const today = new Date();
    const due = new Date(task.dueDate);
    return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
      && a.getMonth() === b.getMonth()
      && a.getDate() === b.getDate();
  }
}
