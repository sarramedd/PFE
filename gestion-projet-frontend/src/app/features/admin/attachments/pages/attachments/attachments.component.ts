import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AutomationService } from 'src/app/core/services/automation.service';
import { MilestoneService } from 'src/app/core/services/milestone.service';
import { PermissionService } from 'src/app/core/services/permission.service';
import { ReportingService } from 'src/app/core/services/reporting.service';
import { AutomationRule } from 'src/app/shared/models/automation-rule.model';
import { Milestone } from 'src/app/shared/models/milestone.model';
import { PermissionByAction, PermissionMatrix } from 'src/app/shared/models/permission.model';
import { Project } from 'src/app/shared/models/project.model';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { ProjectService } from '../../../projects/services/project.service';
import { TaskService } from '../../../tasks/services/task.service';

@Component({
  selector: 'app-attachments',
  templateUrl: './attachments.component.html',
  styleUrls: ['./attachments.component.css']
})
export class AttachmentsComponent implements OnInit {
  projects: Project[] = [];
  tasks: Task[] = [];
  milestones: Milestone[] = [];
  automations: AutomationRule[] = [];
  selectedProjectId: number | null = null;
  ganttRangeStart: Date = new Date();
  ganttRangeEnd: Date = new Date();
  kpiSummary: Record<string, unknown> | null = null;
  weeklyLoad: Array<Record<string, unknown>> = [];
  effortSummary: Array<Record<string, unknown>> = [];
  myPermissions: Partial<PermissionByAction> = {};
  permissionMatrix: PermissionMatrix = {};
  loading = true;
  errorMessage = '';

  permissionActions: Array<{ key: keyof PermissionByAction; label: string }> = [
    { key: 'DELETE_PROJECT', label: 'Delete Project' },
    { key: 'DELETE_TASK', label: 'Delete Task' },
    { key: 'VIEW_REPORTING', label: 'View Reporting' },
    { key: 'MANAGE_MEMBERS', label: 'Manage Members' }
  ];

  newMilestone: Partial<Milestone> = { title: '', description: '', dueDate: '', completed: false };
  newAutomation: Partial<AutomationRule> = {
    name: '',
    triggerStatus: TaskStatus.DONE,
    actionType: 'NOTIFY_PROJECT_MANAGER',
    enabled: true,
    followUpDelayDays: 3,
    followUpTitleTemplate: ''
  };

  constructor(
    private projectService: ProjectService,
    private taskService: TaskService,
    private milestoneService: MilestoneService,
    private automationService: AutomationService,
    private reportingService: ReportingService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  get filteredTasks(): Task[] {
    if (!this.selectedProjectId) {
      return this.tasks;
    }
    return this.tasks.filter((task) => (task.project?.id || task.projectId) === this.selectedProjectId);
  }

  get filteredMilestones(): Milestone[] {
    if (!this.selectedProjectId) {
      return this.milestones;
    }
    return this.milestones.filter((item) => item.project?.id === this.selectedProjectId);
  }

  get totalRangeDays(): number {
    const start = this.stripTime(this.ganttRangeStart).getTime();
    const end = this.stripTime(this.ganttRangeEnd).getTime();
    const diff = Math.max(end - start, 0);
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1, 1);
  }

  get permissionRoles(): string[] {
    return Object.keys(this.permissionMatrix || {});
  }

  get ganttSvgHeight(): number {
    return Math.max(this.filteredTasks.length * 40 + 80, 220);
  }

  /** Répartition des tâches par membre — calculé depuis les tâches chargées */
  get memberStats(): Array<{
    name: string; total: number; done: number;
    inProgress: number; todo: number; overdue: number;
    estimatedHours: number; completionRate: number;
  }> {
    const map = new Map<number, { name: string; tasks: Task[] }>();
    const today = new Date();
    this.tasks.forEach(task => {
      if (task.assignedTo) {
        const id = task.assignedTo.id;
        if (!map.has(id)) {
          map.set(id, {
            name: `${task.assignedTo.firstName} ${task.assignedTo.lastName}`,
            tasks: []
          });
        }
        map.get(id)!.tasks.push(task);
      }
    });

    return Array.from(map.values()).map(({ name, tasks }) => {
      const done       = tasks.filter(t => t.status === TaskStatus.DONE).length;
      const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
      const todo       = tasks.filter(t => t.status === TaskStatus.TODO).length;
      const overdue    = tasks.filter(t =>
        t.dueDate && t.status !== TaskStatus.DONE && new Date(t.dueDate) < today
      ).length;
      const estimatedHours = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
      const completionRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      return { name, total: tasks.length, done, inProgress, todo, overdue, estimatedHours, completionRate };
    }).sort((a, b) => b.total - a.total);
  }

  /** Progression des tâches par projet — calculé depuis les tâches chargées */
  get projectTaskStats(): Array<{
    name: string; total: number; done: number;
    inProgress: number; overdue: number; completionRate: number;
  }> {
    const map = new Map<number, { name: string; tasks: Task[] }>();
    const today = new Date();
    this.tasks.forEach(task => {
      if (task.project) {
        const id = task.project.id;
        if (!map.has(id)) { map.set(id, { name: task.project.name, tasks: [] }); }
        map.get(id)!.tasks.push(task);
      }
    });

    return Array.from(map.values()).map(({ name, tasks }) => {
      const done       = tasks.filter(t => t.status === TaskStatus.DONE).length;
      const inProgress = tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length;
      const overdue    = tasks.filter(t =>
        t.dueDate && t.status !== TaskStatus.DONE && new Date(t.dueDate) < today
      ).length;
      const completionRate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
      return { name, total: tasks.length, done, inProgress, overdue, completionRate };
    }).sort((a, b) => b.total - a.total).slice(0, 8);
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      projects: this.projectService.getAll(),
      tasks: this.taskService.getAll(),
      automations: this.automationService.getAll(),
      kpi: this.reportingService.getKpiSummary(),
      load: this.reportingService.getWeeklyLoad(),
      effort: this.reportingService.getEffortSummary(),
      myPermissions: this.permissionService.getMine(),
      permissionMatrix: this.permissionService.getMatrix()
    }).subscribe({
      next: ({ projects, tasks, automations, kpi, load, effort, myPermissions, permissionMatrix }) => {
        this.projects = projects;
        this.tasks = tasks;
        this.automations = automations;
        this.kpiSummary = kpi;
        this.weeklyLoad = load;
        this.effortSummary = effort;
        this.myPermissions = myPermissions;
        this.permissionMatrix = permissionMatrix;
        this.selectedProjectId = projects[0]?.id ?? null;
        this.calculateGanttRange();
        this.loadMilestones();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger Planning, Permissions et Reporting.';
        this.loading = false;
      }
    });
  }

  loadMilestones(): void {
    if (!this.selectedProjectId) {
      this.milestones = [];
      return;
    }

    this.milestoneService.getByProject(this.selectedProjectId).subscribe({
      next: (items) => {
        this.milestones = items.map((item) => ({ ...item, project: { id: this.selectedProjectId! } }));
      },
      error: () => {
        this.milestones = [];
      }
    });
  }

  onProjectChange(): void {
    this.loadMilestones();
  }

  createMilestone(): void {
    if (!this.selectedProjectId || !this.newMilestone.title?.trim() || !this.newMilestone.dueDate) {
      return;
    }

    this.milestoneService.create({
      ...this.newMilestone,
      project: { id: this.selectedProjectId },
      completed: !!this.newMilestone.completed
    }).subscribe({
      next: () => {
        this.newMilestone = { title: '', description: '', dueDate: '', completed: false };
        this.loadMilestones();
      }
    });
  }

  createAutomation(): void {
    if (!this.newAutomation.name?.trim()) {
      return;
    }

    this.automationService.create(this.newAutomation).subscribe({
      next: (rule) => {
        this.automations = [rule, ...this.automations];
        this.newAutomation = {
          name: '',
          triggerStatus: TaskStatus.DONE,
          actionType: 'NOTIFY_PROJECT_MANAGER',
          enabled: true,
          followUpDelayDays: 3,
          followUpTitleTemplate: ''
        };
      }
    });
  }

  toggleRule(rule: AutomationRule): void {
    this.automationService.toggle(rule.id, !rule.enabled).subscribe({
      next: (updated) => {
        this.automations = this.automations.map((item) => item.id === updated.id ? updated : item);
      }
    });
  }

  exportKpi(format: 'csv' | 'xlsx' | 'pdf'): void {
    if (format === 'xlsx') {
      this.reportingService.exportKpiXlsx().subscribe((blob) => this.downloadBlob(blob, 'kpi-report.xlsx'));
      return;
    }
    if (format === 'pdf') {
      this.reportingService.exportKpiPdf().subscribe((blob) => this.downloadBlob(blob, 'kpi-report.pdf'));
      return;
    }
    this.reportingService.exportKpiCsv().subscribe((blob) => this.downloadBlob(blob, 'kpi-report.csv'));
  }

  exportLoad(format: 'csv' | 'xlsx' | 'pdf'): void {
    if (format === 'xlsx') {
      this.reportingService.exportMemberLoadXlsx().subscribe((blob) => this.downloadBlob(blob, 'member-load-report.xlsx'));
      return;
    }
    if (format === 'pdf') {
      this.reportingService.exportMemberLoadPdf().subscribe((blob) => this.downloadBlob(blob, 'member-load-report.pdf'));
      return;
    }
    this.reportingService.exportMemberLoadCsv().subscribe((blob) => this.downloadBlob(blob, 'member-load-report.csv'));
  }

  exportEffort(format: 'csv' | 'xlsx' | 'pdf'): void {
    if (format === 'xlsx') {
      this.reportingService.exportEffortSummaryXlsx().subscribe((blob) => this.downloadBlob(blob, 'effort-summary.xlsx'));
      return;
    }
    if (format === 'pdf') {
      this.reportingService.exportEffortSummaryPdf().subscribe((blob) => this.downloadBlob(blob, 'effort-summary.pdf'));
      return;
    }
    this.reportingService.exportEffortSummaryCsv().subscribe((blob) => this.downloadBlob(blob, 'effort-summary.csv'));
  }

  exportSvg(svgId: string, fileName: string): void {
    const svg = document.getElementById(svgId) as SVGSVGElement | null;
    if (!svg) {
      return;
    }

    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    this.downloadBlob(blob, fileName);
  }

  exportSvgAsPng(svgId: string, fileName: string): void {
    const svg = document.getElementById(svgId) as SVGSVGElement | null;
    if (!svg) {
      return;
    }

    const source = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const width = Number(svg.getAttribute('width') || svg.clientWidth || 900);
      const height = Number(svg.getAttribute('height') || svg.clientHeight || 280);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }

      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) {
          this.downloadBlob(blob, fileName);
        }
        URL.revokeObjectURL(url);
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
    };

    image.src = url;
  }

  ganttLeftPercent(task: Task): number {
    const startDate = this.resolveTaskStart(task);
    if (!startDate) {
      return 0;
    }

    const diffDays = this.daysBetween(this.ganttRangeStart, startDate);
    return this.toPercent(diffDays);
  }

  ganttWidthPercent(task: Task): number {
    const start = this.resolveTaskStart(task);
    const end = this.resolveTaskEnd(task);
    if (!start || !end) {
      return 2;
    }

    const duration = Math.max(this.daysBetween(start, end) + 1, 1);
    return Math.max(this.toPercent(duration), 2);
  }

  hasPermission(action: keyof PermissionByAction): boolean {
    return !!this.myPermissions?.[action];
  }

  ganttSvgLeft(task: Task): number {
    const timelineStart = 260;
    const timelineWidth = 620;
    return timelineStart + (this.ganttLeftPercent(task) / 100) * timelineWidth;
  }

  ganttSvgWidth(task: Task): number {
    const timelineWidth = 620;
    return Math.max((this.ganttWidthPercent(task) / 100) * timelineWidth, 12);
  }

  ganttSvgY(index: number): number {
    return 24 + index * 40;
  }

  taskTone(task: Task): string {
    if (task.status === TaskStatus.DONE) {
      return '#45b88f';
    }
    if (task.status === TaskStatus.IN_PROGRESS) {
      return '#5f8dff';
    }
    return '#f59c7b';
  }

  shortTaskTitle(task: Task): string {
    const title = task.title || 'Task';
    return title.length > 28 ? `${title.slice(0, 28)}...` : title;
  }

  private resolveTaskStart(task: Task): Date | null {
    if (task.dependsOn?.id) {
      const dependency = this.tasks.find((item) => item.id === task.dependsOn?.id);
      if (dependency?.dueDate) {
        const dependencyDate = new Date(dependency.dueDate);
        dependencyDate.setDate(dependencyDate.getDate() + 1);
        return this.stripTime(dependencyDate);
      }
    }

    if (task.createdAt) {
      return this.stripTime(new Date(task.createdAt));
    }

    return task.dueDate ? this.stripTime(new Date(task.dueDate)) : null;
  }

  private resolveTaskEnd(task: Task): Date | null {
    if (task.dueDate) {
      return this.stripTime(new Date(task.dueDate));
    }

    const start = this.resolveTaskStart(task);
    if (!start) {
      return null;
    }

    const fallback = new Date(start);
    fallback.setDate(fallback.getDate() + 2);
    return fallback;
  }

  private calculateGanttRange(): void {
    const dates: Date[] = [];
    this.tasks.forEach((task) => {
      if (task.createdAt) {
        dates.push(this.stripTime(new Date(task.createdAt)));
      }
      if (task.dueDate) {
        dates.push(this.stripTime(new Date(task.dueDate)));
      }
    });

    if (!dates.length) {
      const today = this.stripTime(new Date());
      this.ganttRangeStart = today;
      this.ganttRangeEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
      return;
    }

    const min = new Date(Math.min(...dates.map((date) => date.getTime())));
    const max = new Date(Math.max(...dates.map((date) => date.getTime())));
    this.ganttRangeStart = new Date(min.getFullYear(), min.getMonth(), min.getDate() - 2);
    this.ganttRangeEnd = new Date(max.getFullYear(), max.getMonth(), max.getDate() + 3);
  }

  private daysBetween(from: Date, to: Date): number {
    const start = this.stripTime(from).getTime();
    const end = this.stripTime(to).getTime();
    return Math.max(Math.round((end - start) / (1000 * 60 * 60 * 24)), 0);
  }

  private toPercent(days: number): number {
    return (days / this.totalRangeDays) * 100;
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
