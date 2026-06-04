import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectMember, ProjectMemberRole } from 'src/app/shared/models/project-member.model';

@Injectable({ providedIn: 'root' })
export class ProjectMemberService {

  private apiUrl = '/api/project-members';

  constructor(private http: HttpClient) {}

  // GET /api/project-members/project/{projectId}
  getMembers(projectId: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.apiUrl}/project/${projectId}`);
  }

  // POST /api/project-members  (body: { project: { id }, user: { id }, roleInProject })
  addMember(projectId: number, userId: number, roleInProject: ProjectMemberRole | string): Observable<ProjectMember> {
    const body = {
      project:       { id: projectId },
      user:          { id: userId },
      roleInProject: roleInProject
    };
    return this.http.post<ProjectMember>(this.apiUrl, body);
  }

  // PUT /api/project-members?projectId=&userId=&roleInProject=
  updateRole(projectId: number, userId: number, roleInProject: ProjectMemberRole | string): Observable<ProjectMember> {
    const params = new HttpParams()
      .set('projectId',      projectId.toString())
      .set('userId',         userId.toString())
      .set('roleInProject',  roleInProject);
    return this.http.put<ProjectMember>(this.apiUrl, null, { params });
  }

  // DELETE /api/project-members?projectId=&userId=
  removeMember(projectId: number, userId: number): Observable<void> {
    const params = new HttpParams()
      .set('projectId', projectId.toString())
      .set('userId',    userId.toString());
    return this.http.delete<void>(this.apiUrl, { params });
  }

  inviteMember(projectId: number, email: string, role: ProjectMemberRole = ProjectMemberRole.MEMBER): Observable<string> {
    return this.http.post(`${this.apiUrl}/invite`, {
      projectId,
      email,
      role
    }, { responseType: 'text' });
  }
}
