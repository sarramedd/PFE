import { Component, OnInit } from '@angular/core';
import { Project, ProjectStatus } from 'src/app/models/project';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  projects: Project[] = [];
  selectedProject: Project | null = null;
  showAddModal    = false;
  showEditModal   = false;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  // ── Stats getters ──────────────────────────────────────────────
  get activeCount():    number { return this.projects.filter(p => p.status === ProjectStatus.ACTIVE).length; }
  get archivedCount(): number { return this.projects.filter(p => p.status === ProjectStatus.ARCHIVED).length; }
  get completedCount():  number { return this.projects.filter(p => p.status === ProjectStatus.COMPLETED).length; }

  // ── Data ───────────────────────────────────────────────────────
  loadProjects(): void {
    this.projectService.getAll().subscribe(data => {
      this.projects = data;
    });
  }

  deleteProject(id: number): void {
    if (!confirm('Are you sure you want to delete this project?')) return;
    this.projectService.delete(id).subscribe(() => this.loadProjects());
  }

  // ── Modals ─────────────────────────────────────────────────────
  openAddModal(): void  { this.showAddModal = true; }
  closeAddModal(): void { this.showAddModal = false; }

  openEditModal(project: Project): void {
    this.selectedProject = { ...project };
    this.showEditModal   = true;
  }
  closeEditModal(): void {
    this.showEditModal   = false;
    this.selectedProject = null;
  }

  onProjectAdded(): void {
    this.closeAddModal();
    this.loadProjects();
  }

  onProjectUpdated(): void {
    this.closeEditModal();
    this.loadProjects();
  }

  // ── Helpers ────────────────────────────────────────────────────
  getStatusClass(status?: string): string {
    const map: Record<string, string> = {
      PLANNED:     'badge-planned',
      IN_PROGRESS: 'badge-progress',
      COMPLETED:   'badge-completed',
      CANCELLED:   'badge-cancelled'
    };
    return map[status ?? ''] ?? '';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  showMembersModal = false;

openMembersModal(project: Project): void {
  this.selectedProject  = project;
  this.showMembersModal = true;
}
closeMembersModal(): void {
  this.showMembersModal = false;
}
}