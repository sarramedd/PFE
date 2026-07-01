import { Component, OnDestroy, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Subscription } from 'rxjs';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { CommentReactionService } from 'src/app/core/services/comment-reaction.service';
import { ProjectService } from 'src/app/features/admin/projects/services/project.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { CommentMessage } from 'src/app/shared/models/comment.model';
import { CommentReaction, ReactionType } from 'src/app/shared/models/comment-reaction.model';
import { Project } from 'src/app/shared/models/project.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-frontoffice-messages',
  templateUrl: './frontoffice-messages.component.html',
  styleUrls: ['./frontoffice-messages.component.css']
})
export class FrontofficeMessagesComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('chatBody') chatBodyRef!: ElementRef<HTMLDivElement>;

  currentUser: User | null = null;
  projects: Project[] = [];
  messages: CommentMessage[] = [];
  selectedProject: Project | null = null;
  draftMessage = '';
  projectSearch = '';
  loadingProjects = true;
  loadingMessages = false;
  sending = false;
  errorMessage = '';

  // Reactions
  reactions = new Map<number, CommentReaction[]>();
  loadedReactions = new Set<number>();
  reactionPickerFor: number | null = null;

  readonly EMOJI_MAP: Record<ReactionType, string> = {
    LIKE: '👍', LOVE: '❤️', CLAP: '👏', ROCKET: '🚀', THANKS: '🙏'
  };
  readonly REACTION_TYPES: ReactionType[] = ['LIKE', 'LOVE', 'CLAP', 'ROCKET', 'THANKS'];

  private messagesSub: Subscription | null = null;
  private activeProjectId: number | null = null;
  private shouldScroll = false;

  get filteredProjects(): Project[] {
    const q = this.projectSearch.trim().toLowerCase();
    return q ? this.projects.filter(p => p.name.toLowerCase().includes(q)) : this.projects;
  }

  projectInitials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  constructor(
    private currentUserService: CurrentUserService,
    private projectService: ProjectService,
    private commentService: CommentService,
    private reactionService: CommentReactionService,
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

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
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
    this.reactionPickerFor = null;
    this.reactions.clear();
    this.loadedReactions.clear();
    this.messagesSub?.unsubscribe();

    if (this.activeProjectId && this.activeProjectId !== projectId) {
      this.commentService.disconnectProject(this.activeProjectId);
    }

    this.activeProjectId = projectId;
    this.messagesSub = this.commentService.watchProjectMessages(projectId).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.loadingMessages = false;
        this.shouldScroll = true;
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
        this.shouldScroll = true;
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

  // ===================== REACTIONS =====================

  loadReactions(messageId: number): void {
    if (this.loadedReactions.has(messageId)) return;
    this.loadedReactions.add(messageId);
    this.reactionService.getByComment(messageId).subscribe({
      next: (r) => this.reactions.set(messageId, r),
      error: () => {}
    });
  }

  togglePicker(messageId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.reactionPickerFor = this.reactionPickerFor === messageId ? null : messageId;
  }

  closePicker(): void {
    this.reactionPickerFor = null;
  }

  toggleReaction(message: CommentMessage, type: ReactionType): void {
    const msgId = message.id;
    const current = this.reactions.get(msgId) ?? [];
    const mine = current.find(r => r.reactionType === type && r.user?.id === this.currentUser?.id);
    this.reactionPickerFor = null;

    if (mine) {
      // Optimistic remove
      this.reactions.set(msgId, current.filter(r => r.id !== mine.id));
      this.reactionService.remove(msgId, type).subscribe({ error: () => this.reactions.set(msgId, current) });
    } else {
      // Optimistic add
      const optimistic: CommentReaction = { id: -Date.now(), reactionType: type, user: this.currentUser as any };
      this.reactions.set(msgId, [...current, optimistic]);
      this.reactionService.add(msgId, type).subscribe({
        next: (created) => {
          const updated = (this.reactions.get(msgId) ?? []).filter(r => r.id !== optimistic.id);
          this.reactions.set(msgId, [...updated, created]);
        },
        error: () => this.reactions.set(msgId, current)
      });
    }
  }

  hasMyReaction(messageId: number, type: ReactionType): boolean {
    return (this.reactions.get(messageId) ?? [])
      .some(r => r.reactionType === type && r.user?.id === this.currentUser?.id);
  }

  /** Reactions groupées par type pour un message */
  groupedReactions(messageId: number): Array<{ type: ReactionType; emoji: string; count: number; iMine: boolean }> {
    const list = this.reactions.get(messageId) ?? [];
    return this.REACTION_TYPES
      .map(type => ({
        type,
        emoji: this.EMOJI_MAP[type],
        count: list.filter(r => r.reactionType === type).length,
        iMine: list.some(r => r.reactionType === type && r.user?.id === this.currentUser?.id)
      }))
      .filter(g => g.count > 0);
  }

  // ======================================================

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom(): void {
    try {
      const el = this.chatBodyRef?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  showDateSeparator(index: number): boolean {
    if (index === 0) return true;
    const prev = this.messages[index - 1]?.createdAt;
    const curr = this.messages[index]?.createdAt;
    if (!prev || !curr) return false;
    return new Date(prev).toDateString() !== new Date(curr).toDateString();
  }

  formatDateLabel(value?: string): string {
    if (!value) return '';
    const d = new Date(value);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  formatTime(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
