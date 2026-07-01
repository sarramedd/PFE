import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectBrief } from 'src/app/shared/models/project-brief.model';

@Injectable({
  providedIn: 'root'
})
export class AiBriefService {
  private readonly apiUrl = '/api/ai';

  constructor(private http: HttpClient) {}

  /** Genere le brief IA d'un projet (peut prendre 5 a 15 secondes). */
  getProjectBrief(projectId: number): Observable<ProjectBrief> {
    return this.http.get<ProjectBrief>(`${this.apiUrl}/project/${projectId}/brief`);
  }
}
