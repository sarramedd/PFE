import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Milestone } from 'src/app/shared/models/milestone.model';

@Injectable({
  providedIn: 'root'
})
export class MilestoneService {
  private readonly apiUrl = 'http://localhost:8088/api/milestones';

  constructor(private http: HttpClient) {}

  getByProject(projectId: number): Observable<Milestone[]> {
    return this.http.get<Milestone[]>(`${this.apiUrl}/project/${projectId}`);
  }

  create(payload: Partial<Milestone>): Observable<Milestone> {
    return this.http.post<Milestone>(this.apiUrl, payload);
  }

  update(id: number, payload: Partial<Milestone>): Observable<Milestone> {
    return this.http.put<Milestone>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
