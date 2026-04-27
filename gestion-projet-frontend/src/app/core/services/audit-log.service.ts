import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuditLogItem } from 'src/app/shared/models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private readonly apiUrl = 'http://localhost:8088/api/audit-logs';

  constructor(private http: HttpClient) {}

  getMine(): Observable<AuditLogItem[]> {
    return this.http.get<AuditLogItem[]>(`${this.apiUrl}/me`);
  }

  getTeam(): Observable<AuditLogItem[]> {
    return this.http.get<AuditLogItem[]>(`${this.apiUrl}/team`);
  }
}
