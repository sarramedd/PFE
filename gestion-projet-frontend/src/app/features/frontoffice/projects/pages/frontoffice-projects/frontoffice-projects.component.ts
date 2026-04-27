import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { Project } from 'src/app/shared/models/project.model';
import { Role, User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-frontoffice-projects',
  templateUrl: './frontoffice-projects.component.html',
  styleUrls: ['./frontoffice-projects.component.css']
})
export class FrontofficeProjectsComponent implements OnInit {
  currentUser: User | null = null;
  projects: Project[] = [];
  loading = true;
  errorMessage = '';
  showAddModal = false;
  showMembersModal = false;
  selectedProject: Project | null = null;
  statusFilter: 'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' = 'ALL';

  constructor(
    private currentUserService: CurrentUserService,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    this.currentUserService.user$.subscribe((user) => {
      this.currentUser = user;

      if (user) {
        this.loadProjects();
      } else {
        this.loading = false;
      }
    });

    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }
  }

  get isProjectManager(): boolean {
    return this.currentUser?.role === Role.PROJECT_MANAGER;
  }

  loadProjects(): void {
    this.loading = true;
    this.errorMessage = '';

    this.projectService.getMine().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Impossible de charger les projets.';
      }
    });
  }

  get filteredProjects(): Project[] {
    if (this.statusFilter === 'ALL') {
      return this.projects;
    }
    return this.projects.filter((project) => (project.status || 'ACTIVE') === this.statusFilter);
  }

  setStatusFilter(filter: 'ALL' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'): void {
    this.statusFilter = filter;
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onProjectAdded(): void {
    this.closeAddModal();
    this.loadProjects();
  }

  openMembersModal(project: Project): void {
    this.selectedProject = project;
    this.showMembersModal = true;
  }

  closeMembersModal(): void {
    this.showMembersModal = false;
    this.selectedProject = null;
    this.loadProjects();
  }

  getStatusClass(status?: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-label-success';
      case 'COMPLETED':
        return 'bg-label-primary';
      case 'ARCHIVED':
        return 'bg-label-secondary';
      default:
        return 'bg-label-warning';
    }
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Non definie';
    }

    const date = new Date(value);
    return isNaN(date.getTime())
      ? 'Non definie'
      : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  toggleArchive(project: Project): void {
    const targetStatus = project.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';

    this.projectService.updateStatus(project.id, targetStatus).subscribe({
      next: () => this.loadProjects()
    });
  }
}
