import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { CommentMessage, CreateCommentPayload } from 'src/app/shared/models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly apiUrl = '/api/comments';
  private readonly projectSockets = new Map<number, WebSocket>();
  private readonly projectMessages$ = new Map<number, BehaviorSubject<CommentMessage[]>>();
  private readonly reconnectTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly intentionallyClosed = new Set<number>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getByProject(projectId: number): Observable<CommentMessage[]> {
    return this.http.get<CommentMessage[]>(`${this.apiUrl}/project/${projectId}`);
  }

  getByTask(taskId: number): Observable<CommentMessage[]> {
    return this.http.get<CommentMessage[]>(`${this.apiUrl}/task/${taskId}`);
  }

  create(payload: CreateCommentPayload): Observable<CommentMessage> {
    return this.http.post<CommentMessage>(this.apiUrl, payload);
  }

  watchProjectMessages(projectId: number): Observable<CommentMessage[]> {
    const stream = this.getOrCreateStream(projectId);
    this.getByProject(projectId).subscribe({
      next: (messages) => stream.next(this.sortOldest(messages)),
      error: () => {}
    });
    this.ensureProjectSocket(projectId);
    return stream.asObservable();
  }

  sendProjectMessage(projectId: number, content: string): Observable<CommentMessage> {
    const socket = this.projectSockets.get(projectId);

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ projectId, content }));
      return of({
        id: Date.now(),
        content,
        createdAt: new Date().toISOString(),
        project: { id: projectId } as any
      } as CommentMessage);
    }

    return this.create({ content, project: { id: projectId } });
  }

  disconnectProject(projectId: number): void {
    this.intentionallyClosed.add(projectId);
    const timer = this.reconnectTimers.get(projectId);
    if (timer) {
      clearTimeout(timer);
      this.reconnectTimers.delete(projectId);
    }

    const socket = this.projectSockets.get(projectId);
    if (socket) {
      socket.close();
      this.projectSockets.delete(projectId);
    }
  }

  private ensureProjectSocket(projectId: number): void {
    this.intentionallyClosed.delete(projectId);
    const existing = this.projectSockets.get(projectId);
    if (existing && existing.readyState === WebSocket.OPEN) {
      return;
    }

    const wsUrl = this.authService.buildWebSocketUrl(`/api/ws/projects/${projectId}/messages`);
    const socket = new WebSocket(wsUrl);
    this.projectSockets.set(projectId, socket);

    socket.onopen = () => {
      this.getByProject(projectId).subscribe({
        next: (messages) => this.getOrCreateStream(projectId).next(this.sortOldest(messages)),
        error: () => {}
      });
    };

    socket.onmessage = (event) => {
      const parsed = this.safeParse(event.data);
      const nextState = this.mergeIncoming(projectId, parsed);
      if (nextState) {
        this.getOrCreateStream(projectId).next(this.sortOldest(nextState));
      }
    };

    socket.onclose = () => {
      this.projectSockets.delete(projectId);
      if (this.intentionallyClosed.has(projectId)) {
        return;
      }
      const timer = setTimeout(() => this.ensureProjectSocket(projectId), 2500);
      this.reconnectTimers.set(projectId, timer);
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private getOrCreateStream(projectId: number): BehaviorSubject<CommentMessage[]> {
    if (!this.projectMessages$.has(projectId)) {
      this.projectMessages$.set(projectId, new BehaviorSubject<CommentMessage[]>([]));
    }
    return this.projectMessages$.get(projectId)!;
  }

  private mergeIncoming(projectId: number, payload: unknown): CommentMessage[] | null {
    if (Array.isArray(payload)) {
      return payload as CommentMessage[];
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const envelope = payload as Record<string, unknown>;
    const data = (envelope['data'] ?? envelope['payload'] ?? payload) as unknown;

    if (Array.isArray(data)) {
      return data as CommentMessage[];
    }

    if (!data || typeof data !== 'object') {
      return null;
    }

    const incoming = data as CommentMessage;
    const current = this.getOrCreateStream(projectId).value;
    const idx = current.findIndex((item) => item.id === incoming.id);

    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], ...incoming };
      return updated;
    }

    return [...current, incoming];
  }

  private safeParse(raw: unknown): unknown {
    if (typeof raw !== 'string') {
      return raw;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private sortOldest(items: CommentMessage[]): CommentMessage[] {
    return [...items].sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
  }
}
