import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AutomationRule } from 'src/app/shared/models/automation-rule.model';

@Injectable({
  providedIn: 'root'
})
export class AutomationService {
  private readonly apiUrl = '/api/automations';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AutomationRule[]> {
    return this.http.get<AutomationRule[]>(this.apiUrl);
  }

  create(payload: Partial<AutomationRule>): Observable<AutomationRule> {
    return this.http.post<AutomationRule>(this.apiUrl, payload);
  }

  toggle(id: number, enabled: boolean): Observable<AutomationRule> {
    return this.http.patch<AutomationRule>(`${this.apiUrl}/${id}/enabled?enabled=${enabled}`, {});
  }
}
