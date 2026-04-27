import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AttachmentService } from 'src/app/core/services/attachment.service';
import { CommentService } from 'src/app/core/services/comment.service';
import { AttachmentItem } from 'src/app/shared/models/attachment.model';
import { CommentMessage } from 'src/app/shared/models/comment.model';
import { Task } from 'src/app/shared/models/task.model';

@Component({
  selector: 'app-frontoffice-task-hub',
  templateUrl: './frontoffice-task-hub.component.html',
  styleUrls: ['./frontoffice-task-hub.component.css']
})
export class FrontofficeTaskHubComponent implements OnChanges {
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();

  comments: CommentMessage[] = [];
  attachments: AttachmentItem[] = [];
  loading = false;
  message = '';
  selectedFile: File | null = null;

  constructor(
    private commentService: CommentService,
    private attachmentService: AttachmentService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task']?.currentValue?.id) {
      this.loadHub();
    }
  }

  loadHub(): void {
    if (!this.task?.id) {
      return;
    }

    this.loading = true;

    this.commentService.getByTask(this.task.id).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.loading = false;
      },
      error: () => {
        this.comments = [];
        this.loading = false;
      }
    });

    this.attachmentService.getByTask(this.task.id).subscribe({
      next: (attachments) => {
        this.attachments = attachments;
      },
      error: () => {
        this.attachments = [];
      }
    });
  }

  submitComment(): void {
    if (!this.task?.id || !this.message.trim()) {
      return;
    }

    this.commentService.create({
      content: this.message.trim(),
      task: { id: this.task.id }
    }).subscribe({
      next: () => {
        this.message = '';
        this.loadHub();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  uploadAttachment(): void {
    if (!this.task?.id || !this.selectedFile) {
      return;
    }

    this.attachmentService.upload(this.task.id, this.selectedFile).subscribe({
      next: () => {
        this.selectedFile = null;
        this.loadHub();
      }
    });
  }

  deleteAttachment(attachment: AttachmentItem): void {
    this.attachmentService.delete(attachment.id).subscribe({
      next: () => {
        this.loadHub();
      }
    });
  }

  resolveFileUrl(filePath?: string): string | null {
    return this.attachmentService.resolveFileUrl(filePath);
  }

  formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  getInitials(comment: CommentMessage): string {
    const first = comment.author?.firstName?.trim()?.[0] ?? '';
    const last = comment.author?.lastName?.trim()?.[0] ?? '';
    return `${first}${last}`.toUpperCase() || '?';
  }
}
