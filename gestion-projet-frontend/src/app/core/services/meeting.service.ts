import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AttendeeResponse,
  Meeting,
  MeetingRequest,
  MeetingStatus
} from 'src/app/shared/models/meeting.model';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private readonly api = '/api/meetings';

  constructor(private http: HttpClient) {}

  create(req: MeetingRequest): Observable<Meeting> {
    return this.http.post<Meeting>(this.api, req);
  }

  update(id: number, req: MeetingRequest): Observable<Meeting> {
    return this.http.put<Meeting>(`${this.api}/${id}`, req);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  getById(id: number): Observable<Meeting> {
    return this.http.get<Meeting>(`${this.api}/${id}`);
  }

  getByProject(projectId: number): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.api}/project/${projectId}`);
  }

  /** Reunions a venir ou je suis invite ou organisateur. */
  getMyMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.api}/me`);
  }

  /** Toutes mes reunions (passees + futures). */
  getAllMyMeetings(): Observable<Meeting[]> {
    return this.http.get<Meeting[]>(`${this.api}/me/all`);
  }

  changeStatus(id: number, status: MeetingStatus): Observable<Meeting> {
    return this.http.patch<Meeting>(`${this.api}/${id}/status`, { status });
  }

  updateNotes(id: number, notes: string): Observable<Meeting> {
    return this.http.patch<Meeting>(`${this.api}/${id}/notes`, { notes });
  }

  respond(id: number, response: AttendeeResponse): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.api}/${id}/respond`, { response });
  }

  /** Rejoint la reunion en ligne : passe IN_PROGRESS et retourne roomName. */
  joinMeeting(id: number): Observable<Meeting> {
    return this.http.post<Meeting>(`${this.api}/${id}/join`, {});
  }
}
