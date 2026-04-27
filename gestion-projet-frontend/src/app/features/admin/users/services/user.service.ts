import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from 'src/app/shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8088/api/users';
  private backendBaseUrl = 'http://localhost:8088';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(user: any, avatar?: File | null): Observable<User> {
    const formData = new FormData();
    formData.append('firstName', user.firstName ?? '');
    formData.append('lastName', user.lastName ?? '');
    formData.append('cin', String(user.cin ?? ''));
    formData.append('email', user.email ?? '');
    formData.append('password', user.password ?? '');
    formData.append('role', user.role ?? '');

    if (user.organizationId) {
      formData.append('organizationId', String(user.organizationId));
    }

    if (avatar) {
      formData.append('avatar', avatar);
    }

    return this.http.post<any>(this.apiUrl, formData);
  }

  update(id: number, user: any): Observable<User> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  deactivateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  // Activer un utilisateur
  activateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  resolveAvatarUrl(avatarUrl?: string | null): string | null {
    if (!avatarUrl) {
      return null;
    }

    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }

    return `${this.backendBaseUrl}${avatarUrl}`;
  }
}
