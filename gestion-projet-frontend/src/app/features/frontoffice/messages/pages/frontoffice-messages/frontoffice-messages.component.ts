import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { CommentMessage } from 'src/app/shared/models/comment.model';
import { Project } from 'src/app/shared/models/project.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-frontoffice-messages',
  templateUrl: './frontoffice-messages.component.html',
  styleUrls: ['./frontoffice-messages.component.css']
})
export class FrontofficeMessagesComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  projects: Project[] = [];
  messages: CommentMessage[] = [];
  selectedProject: Project | null = null;
  draftMessage = '';
  loadingProjects = true;
  loadingMessages = false;
  sending = false;
  errorMessage = '';
  private messagesSub: Subscription | null = null;
  private activeProjectId: number | null = null;

  constructor(
    private currentUserService: CurrentUserService,
    private projectService: ProjectService,
    private commentService: CommentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.currentUserService.user$.subscribe((user) => {
      this.currentUser = user;

      if (user) {
        this.loadProjects();
      } else {
        this.loadingProjects = false;
      }
    });

    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.activeProjectId) {
      this.commentService.disconnectProject(this.activeProjectId);
    }
    this.messagesSub?.unsubscribe();
  }

  loadProjects(): void {
    this.loadingProjects = true;
    this.errorMessage = '';

    this.projectService.getMine().subscribe({
      next: (projects) => {
        this.projects = projects;
        this.loadingProjects = false;

        if (projects.length > 0) {
          const nextProject = this.selectedProject
            ? projects.find((project) => project.id === this.selectedProject?.id) ?? projects[0]
            : projects[0];
          this.selectProject(nextProject);
        } else {
          this.selectedProject = null;
          this.messages = [];
          if (this.activeProjectId) {
            this.commentService.disconnectProject(this.activeProjectId);
            this.activeProjectId = null;
          }
        }
      },
      error: () => {
        this.loadingProjects = false;
        this.errorMessage = 'Impossible de charger les conversations de projet.';
      }
    });
  }

  selectProject(project: Project): void {
    this.selectedProject = project;
    this.loadMessages(project.id);
  }

  loadMessages(projectId: number): void {
    this.loadingMessages = true;
    this.errorMessage = '';
    this.messagesSub?.unsubscribe();

    if (this.activeProjectId && this.activeProjectId !== projectId) {
      this.commentService.disconnectProject(this.activeProjectId);
    }

    this.activeProjectId = projectId;
    this.messagesSub = this.commentService.watchProjectMessages(projectId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loadingMessages = false;
      },
      error: () => {
        this.loadingMessages = false;
        this.errorMessage = 'Impossible de charger les messages pour ce projet.';
      }
    });
  }

  sendMessage(): void {
    const content = this.draftMessage.trim();

    if (!this.selectedProject?.id || !content || this.sending) {
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    this.commentService.sendProjectMessage(this.selectedProject.id, content).subscribe({
      next: () => {
        this.draftMessage = '';
        this.sending = false;
      },
      error: () => {
        this.sending = false;
        this.errorMessage = 'Impossible d\'envoyer le message.';
      }
    });
  }

  isMine(message: CommentMessage): boolean {
    return !!this.currentUser?.id && message.author?.id === this.currentUser.id;
  }

  getInitials(message: CommentMessage): string {
    const firstName = message.author?.firstName?.trim()?.[0] ?? '';
    const lastName = message.author?.lastName?.trim()?.[0] ?? '';
    return `${firstName}${lastName}`.toUpperCase() || '?';
  }

  getAuthorLabel(message: CommentMessage): string {
    if (!message.author) {
      return 'Utilisateur';
    }

    return `${message.author.firstName} ${message.author.lastName}`.trim();
  }

  getAvatarUrl(message: CommentMessage): string | null {
    return this.userService.resolveAvatarUrl(message.author?.avatarUrl);
  }

  formatTime(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
