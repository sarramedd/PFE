import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:8088/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  create(user: any): Observable<User> {
    return this.http.post<any>(this.apiUrl, user);
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
}
