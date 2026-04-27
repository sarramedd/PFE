import { Component, OnInit } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { TaskService } from 'src/app/features/admin/tasks/services/task.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { Organization } from 'src/app/shared/models/organization.model';
import { Project, ProjectStatus } from 'src/app/shared/models/project.model';
import { Task, TaskStatus } from 'src/app/shared/models/task.model';
import { User } from 'src/app/shared/models/user.model';

interface OrgPerformance {
  organization: Organization;
  users: number;
  projects: number;
  tasks: number;
  completedTasks: number;
  completionRate: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  loading = true;
  errorMessage = '';

  organizations: Organization[] = [];
  users: User[] = [];
  projects: Project[] = [];
  tasks: Task[] = [];
  currentOrganizationName = 'My organization';
  currentOrganizationLogoUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private userService: UserService,
    private projectService: ProjectService,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get organizationLogo(): string {
    return this.currentOrganizationLogoUrl || 'assets/images/teamflow.png';
  }

  get totalOrganizations(): number {
    return this.organizations.length;
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get totalProjects(): number {
    return this.projects.length;
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get activeOrganizations(): number {
    const orgIdsWithActiveProjects = new Set(
      this.projects
        .filter((project) => project.status !== ProjectStatus.ARCHIVED)
        .map((project) => project.organizationId)
        .filter((value): value is number => typeof value === 'number')
    );
    return orgIdsWithActiveProjects.size;
  }

  get archivedProjects(): number {
    return this.projects.filter((project) => project.status === ProjectStatus.ARCHIVED).length;
  }

  get completedTasks(): number {
    return this.tasks.filter((task) => task.status === TaskStatus.DONE).length;
  }

  get delayedTasks(): number {
    const today = this.stripTime(new Date());
    return this.tasks.filter((task) => {
      if (!task.dueDate || task.status === TaskStatus.DONE) {
        return false;
      }
      return this.stripTime(new Date(task.dueDate)).getTime() < today.getTime();
    }).length;
  }

  get platformCompletionRate(): number {
    if (!this.totalTasks) {
      return 0;
    }
    return Math.round((this.completedTasks / this.totalTasks) * 100);
  }

  get usersByRole(): Array<{ role: string; count: number; percent: number }> {
    const roleMap = new Map<string, number>();
    for (const user of this.users) {
      roleMap.set(user.role, (roleMap.get(user.role) ?? 0) + 1);
    }

    return [...roleMap.entries()]
      .map(([role, count]) => ({
        role,
        count,
        percent: this.totalUsers ? Math.round((count / this.totalUsers) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  get orgPerformance(): OrgPerformance[] {
    return this.organizations
      .map((organization) => {
        const users = this.users.filter((user) => user.organizationId === organization.id);
        const projects = this.projects.filter((project) => project.organizationId === organization.id);
        const tasks = this.tasks.filter((task) => {
          const projectOrgId = task.project?.id
            ? this.projects.find((project) => project.id === task.project?.id)?.organizationId
            : undefined;
          return projectOrgId === organization.id;
        });

        const completedTasks = tasks.filter((task) => task.status === TaskStatus.DONE).length;
        const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

        return {
          organization,
          users: users.length,
          projects: projects.length,
          tasks: tasks.length,
          completedTasks,
          completionRate
        };
      })
      .sort((a, b) => b.users - a.users || b.projects - a.projects)
      .slice(0, 6);
  }

  get latestUsers(): User[] {
    return [...this.users]
      .sort((a, b) => this.sortByDateDesc(a.createdAt, b.createdAt))
      .slice(0, 6);
  }

  get latestProjects(): Project[] {
    return [...this.projects]
      .sort((a, b) => this.sortByDateDesc(a.createdAt, b.createdAt))
      .slice(0, 6);
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    const organizations$ = (this.isSuperAdmin
      ? this.organizationService.getAll()
      : this.organizationService.getMine().pipe(map((organization) => [organization]))
    ).pipe(catchError(() => of<Organization[]>([])));

    forkJoin({
      organizations: organizations$,
      users: this.userService.getAll(),
      projects: this.projectService.getAll(),
      tasks: this.taskService.getAll()
    }).subscribe({
      next: ({ organizations, users, projects, tasks }) => {
        this.organizations = organizations;
        this.users = users;
        this.projects = projects;
        this.tasks = tasks;
        this.resolveOrganizationBranding();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les indicateurs de dashboard.';
      }
    });
  }

  private resolveOrganizationBranding(): void {
    if (this.isSuperAdmin) {
      this.currentOrganizationName = 'TeamFlow Platform';
      this.currentOrganizationLogoUrl = 'assets/images/teamflow.png';
      return;
    }

    const organizationId = this.authService.getOrganizationId();
    const currentUserId = this.authService.getUserId();
    const fromList = organizationId
      ? this.organizations.find((organization) => organization.id === organizationId)
      : undefined;

    const fromCurrentUser = currentUserId
      ? this.users.find((user) => user.id === currentUserId)
      : undefined;

    this.currentOrganizationName = fromList?.name
      || fromCurrentUser?.organizationName
      || this.users.find((user) => !!user.organizationName)?.organizationName
      || 'My organization';

    this.currentOrganizationLogoUrl =
      this.organizationService.resolveLogoUrl(fromCurrentUser?.organizationLogoUrl)
      || this.organizationService.resolveLogoUrl(fromList?.logoUrl ?? null);
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'N/A';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'N/A';
    }

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  roleLabel(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ORGANIZATION_ADMIN':
        return 'Org Admin';
      case 'PROJECT_MANAGER':
        return 'Project Manager';
      default:
        return role;
    }
  }

  private sortByDateDesc(a?: string, b?: string): number {
    const first = a ? new Date(a).getTime() : 0;
    const second = b ? new Date(b).getTime() : 0;
    return second - first;
  }

  private stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
