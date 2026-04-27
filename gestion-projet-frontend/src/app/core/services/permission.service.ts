import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionMatrix, PermissionByAction } from 'src/app/shared/models/permission.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private readonly apiUrl = 'http://localhost:8088/api/permissions';

  constructor(private http: HttpClient) {}

  getMine(): Observable<Partial<PermissionByAction>> {
    return this.http.get<Partial<PermissionByAction>>(`${this.apiUrl}/me`);
  }

  getMatrix(): Observable<PermissionMatrix> {
    return this.http.get<PermissionMatrix>(`${this.apiUrl}/matrix`);
  }
}
