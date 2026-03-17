import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/task';

@Injectable({ providedIn: 'root' })
export class TaskService {

  private base = 'http://localhost:8088/api';

  constructor(private http: HttpClient) {}

  getByProject(projectId: number): Observable<Task[]> {
  return this.http.get<Task[]>(`${this.base}/tasks/project/${projectId}`);
}

  create(task: any): Observable<Task> {
    return this.http.post<Task>(`${this.base}/tasks`, task);
  }

  update(id: number, task: any): Observable<Task> {
    return this.http.put<Task>(`${this.base}/tasks/${id}`, task);
  }

  updateStatus(id: number, status: string): Observable<Task> {
  return this.http.patch<Task>(
    `${this.base}/tasks/${id}/status?status=${status}`,
    null   // ← pas de body
  );
}

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/tasks/${id}`);
  }
}