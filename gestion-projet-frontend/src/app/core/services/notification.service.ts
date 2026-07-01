import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationItem } from 'src/app/shared/models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly apiUrl = '/api/notifications';
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionallyClosed = false;
  private readonly liveNotifications$ = new BehaviorSubject<NotificationItem[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  getMine(): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.apiUrl}/me`);
  }

  getMineByType(type: NonNullable<NotificationItem['type']>): Observable<NotificationItem[]> {
    return this.http.get<NotificationItem[]>(`${this.apiUrl}/me/type/${type}`);
  }

  markAsRead(id: number): Observable<NotificationItem> {
    return this.http.patch<NotificationItem>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap((updated) => {
        const next = this.liveNotifications$.value.map((item) =>
          item.id === id ? { ...item, ...updated, isRead: true } : item
        );
        this.liveNotifications$.next(next);
      })
    );
  }

  markManyAsRead(ids: number[]): void {
    ids.forEach((id) => {
      this.markAsRead(id).subscribe();
    });
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/me/read-all`, {}).pipe(
      tap(() => {
        const updated = this.liveNotifications$.value.map((item) => ({ ...item, isRead: true }));
        this.liveNotifications$.next(updated);
      })
    );
  }

  watchMineLive(): Observable<NotificationItem[]> {
    this.getMine().subscribe({
      next: (items) => this.liveNotifications$.next(this.sortNewest(items)),
      error: () => {}
    });
    this.ensureConnected();
    return this.liveNotifications$.asObservable();
  }

  disconnectLive(): void {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  private ensureConnected(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return;
    }

    this.intentionallyClosed = false;
    const wsUrl = this.authService.buildWebSocketUrl('/api/ws/notifications');
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      // Les données sont déjà chargées via getMine() dans watchMineLive().
      // Pas de second appel ici pour éviter la race condition avec markAsRead.
    };

    this.socket.onmessage = (event) => {
      const parsed = this.safeParse(event.data);
      const nextState = this.mergeIncoming(parsed);
      if (nextState) {
        this.liveNotifications$.next(this.sortNewest(nextState));
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (this.intentionallyClosed) {
        return;
      }
      this.reconnectTimer = setTimeout(() => this.ensureConnected(), 2500);
    };

    this.socket.onerror = () => {
      this.socket?.close();
    };
  }

  private mergeIncoming(payload: unknown): NotificationItem[] | null {
    if (Array.isArray(payload)) {
      return payload as NotificationItem[];
    }

    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const envelope = payload as Record<string, unknown>;
    const data = (envelope['data'] ?? envelope['payload'] ?? payload) as unknown;

    if (Array.isArray(data)) {
      return data as NotificationItem[];
    }

    if (!data || typeof data !== 'object') {
      return null;
    }

    const incoming = data as NotificationItem;
    const current = this.liveNotifications$.value;
    const idx = current.findIndex((item) => item.id === incoming.id);

    if (idx >= 0) {
      const updated = [...current];
      updated[idx] = { ...updated[idx], ...incoming };
      return updated;
    }

    return [incoming, ...current];
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

  private sortNewest(items: NotificationItem[]): NotificationItem[] {
    return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}
