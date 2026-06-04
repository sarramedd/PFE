import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NotificationPreference } from 'src/app/shared/models/notification-preference.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationPreferenceService {
  private readonly apiUrl = '/api/notification-preferences';

  constructor(private http: HttpClient) {}

  getMine(): Observable<NotificationPreference> {
    return this.http.get<NotificationPreference>(`${this.apiUrl}/me`);
  }

  updateMine(payload: NotificationPreference): Observable<NotificationPreference> {
    return this.http.put<NotificationPreference>(`${this.apiUrl}/me`, payload);
  }
}
