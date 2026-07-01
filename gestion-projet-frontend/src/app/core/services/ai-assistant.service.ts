import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AssigneeSuggestionRequest,
  AssigneeSuggestionResponse,
  DiscussionSummaryResponse,
  RiskTasksResponse,
  TaskDescriptionRequest,
  TaskDescriptionResponse
} from 'src/app/shared/models/ai-assistant.model';

@Injectable({
  providedIn: 'root'
})
export class AiAssistantService {
  private readonly base = '/api/ai';

  constructor(private http: HttpClient) {}

  /** Genere description + criteres + estimation a partir d'un titre court. */
  describeTask(req: TaskDescriptionRequest): Observable<TaskDescriptionResponse> {
    return this.http.post<TaskDescriptionResponse>(`${this.base}/task/describe`, req);
  }

  /** Suggere les meilleurs membres pour prendre une tache. */
  suggestAssignee(req: AssigneeSuggestionRequest): Observable<AssigneeSuggestionResponse> {
    return this.http.post<AssigneeSuggestionResponse>(`${this.base}/task/suggest-assignee`, req);
  }

  /** Identifie les taches a risque dans un projet. */
  detectRiskTasks(projectId: number): Observable<RiskTasksResponse> {
    return this.http.get<RiskTasksResponse>(`${this.base}/project/${projectId}/risk-tasks`);
  }

  /** Resume la discussion d'un projet (jusqu'a 60 commentaires les + recents). */
  summarizeDiscussion(projectId: number): Observable<DiscussionSummaryResponse> {
    return this.http.get<DiscussionSummaryResponse>(`${this.base}/project/${projectId}/discussion-summary`);
  }
}
