import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AttachmentItem } from 'src/app/shared/models/attachment.model';

@Injectable({
  providedIn: 'root'
})
export class AttachmentService {
  private readonly apiUrl = 'http://localhost:8088/api/attachments';
  private readonly backendBaseUrl = 'http://localhost:8088';

  constructor(private http: HttpClient) {}

  getByTask(taskId: number): Observable<AttachmentItem[]> {
    return this.http.get<AttachmentItem[]>(`${this.apiUrl}/task/${taskId}`);
  }

  getByProject(projectId: number): Observable<AttachmentItem[]> {
    return this.http.get<AttachmentItem[]>(`${this.apiUrl}/project/${projectId}`);
  }

  upload(taskId: number, file: File): Observable<AttachmentItem> {
    const formData = new FormData();
    formData.append('taskId', String(taskId));
    formData.append('file', file);
    return this.http.post<AttachmentItem>(this.apiUrl, formData);
  }

  uploadToProject(projectId: number, file: File): Observable<AttachmentItem> {
    const formData = new FormData();
    formData.append('projectId', String(projectId));
    formData.append('file', file);
    return this.http.post<AttachmentItem>(`${this.apiUrl}/project`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resolveFileUrl(filePath?: string | null): string | null {
    if (!filePath) {
      return null;
    }

    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }

    return `${this.backendBaseUrl}${filePath}`;
  }
}
