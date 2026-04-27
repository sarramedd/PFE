import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
          this.errorMessage = 'Impossible de charger votre session.';
          return;
        }

        this.currentUser = user;
        this.loadDashboard(user);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger votre tableau de bord.';
      }
    });
  }

  ngOnDestroy(): void {
    this.notificationsSub?.unsubscribe();
  }

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Bonjour';
    }
    if (hour < 18) {
      return 'Bon apres-midi';
    }
    return 'Bonsoir';
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
      { label: 'To do', value: todo, percent: Math.round((todo / total) * 100), tone: 'violet' },
      { label: 'In progress', value: inProgress, percent: Math.round((inProgress / total) * 100), tone: 'sky' },
      { label: 'Done', value: done, percent: Math.round((done / total) * 100), tone: 'mint' }
    ];
  }

  get deadlineBars(): DashboardBar[] {
    const total = this.dashboardTasks.length || 1;
    const overdue = this.dashboardOverdueTasks.length;
    const today = this.dashboardTasksDueToday.length;
    const week = this.dashboardTasks.filter((task) => this.isTaskInCurrentWeek(task)).length;
    const month = this.dashboardTasks.filter((task) => this.isTaskInCurrentMonth(task)).length;

    return [
      { label: 'En retard', value: overdue, percent: Math.round((overdue / total) * 100), tone: 'rose' },
      { label: "Aujourd'hui", value: today, percent: Math.round((today / total) * 100), tone: 'amber' },
      { label: 'Cette semaine', value: week, percent: Math.round((week / total) * 100), tone: 'sky' },
      { label: 'Ce mois', value: month, percent: Math.round((month / total) * 100), tone: 'mint' }
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
        title: 'Detection de retard active',
        description: `${overdue} tache${overdue > 1 ? 's sont' : ' est'} en retard. Priorise ces elements pour reduire le risque de blocage.`,
        tone: 'danger'
      });
    }

    if (dueSoon > 0) {
      insights.push({
        title: 'Echeances proches',
        description: `${dueSoon} tache${dueSoon > 1 ? 's arrivent' : ' arrive'} dans les prochaines 48 heures.`,
        tone: 'warning'
      });
    }

    if (riskyProject) {
      insights.push({
        title: 'Projet a surveiller',
        description: `${riskyProject.project.name} montre un risque de retard avec ${riskyProject.delayed} tache${riskyProject.delayed > 1 ? 's' : ''} en retard et ${riskyProject.progress}% de progression.`,
        tone: riskyProject.delayed > 0 ? 'warning' : 'info'
      });
    }

    if (insights.length === 0) {
      insights.push({
        title: 'Rythme sain',
        description: 'Aucun signal de retard detecte pour le moment. Tu peux te concentrer sur les prochaines echeances.',
        tone: 'success'
      });
    }

    return insights.slice(0, 3);
  }

  get quickActions(): Array<{ label: string; route: string; icon: string; tone: string }> {
    return [
      { label: 'Mes projets', route: '/frontoffice/projects', icon: 'bx bx-briefcase-alt-2', tone: 'lilac' },
      { label: 'Mes taches', route: '/frontoffice/tasks', icon: 'bx bx-task', tone: 'sky' },
      { label: 'Messages', route: '/frontoffice/messages', icon: 'bx bx-message-dots', tone: 'peach' },
      { label: 'Profil', route: '/frontoffice/profile', icon: 'bx bx-user-circle', tone: 'mint' }
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
      { value: this.projectTasks.length, label: 'Taches equipe' },
      { value: this.completedTasksCount, label: 'Done equipe' },
      { value: this.overdueTasksCount, label: 'Retards equipe' },
      { value: this.uniqueContributorsCount, label: 'Membres actifs' }
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
    if (!value) {
      return 'Sans date';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Sans date';
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getTaskStatusLabel(status: string): string {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 'In progress';
      case TaskStatus.DONE:
        return 'Done';
      default:
        return 'To do';
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return 'status-progress';
      case TaskStatus.DONE:
        return 'status-done';
      default:
        return 'status-todo';
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
