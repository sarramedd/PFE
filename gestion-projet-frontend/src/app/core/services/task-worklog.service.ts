import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaskWorklog } from 'src/app/shared/models/task-worklog.model';

@Injectable({
  providedIn: 'root'
})
export class TaskWorklogService {
  private readonly apiUrl = 'http://localhost:8088/api/worklogs';

  constructor(private http: HttpClient) {}

  getByTask(taskId: number): Observable<TaskWorklog[]> {
    return this.http.get<TaskWorklog[]>(`${this.apiUrl}/task/${taskId}`);
  }

  getTaskSummary(taskId: number): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/task/${taskId}/summary`);
  }

  getActiveTimer(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/timer/active`);
  }

  startTimer(taskId: number): Observable<Record<string, unknown>> {
    return this.http.post<Record<string, unknown>>(`${this.apiUrl}/timer/start?taskId=${taskId}`, {});
  }

  stopTimer(notes = ''): Observable<TaskWorklog> {
    return this.http.post<TaskWorklog>(`${this.apiUrl}/timer/stop`, { notes });
  }

  create(payload: Partial<TaskWorklog> & { task: { id: number }; minutesSpent: number }): Observable<TaskWorklog> {
    return this.http.post<TaskWorklog>(this.apiUrl, payload);
  }
}
