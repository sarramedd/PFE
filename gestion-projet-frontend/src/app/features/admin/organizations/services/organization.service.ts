import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Organization } from 'src/app/shared/models/organization.model';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private readonly apiUrl = 'http://localhost:8088/api/organizations';
  private readonly backendBaseUrl = 'http://localhost:8088';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  getMine(): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/me`);
  }

  create(payload: Partial<Organization>, logo?: File | null): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, this.buildFormData(payload, logo));
  }

  update(id: number, payload: Partial<Organization>, logo?: File | null): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, this.buildFormData(payload, logo));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  resolveLogoUrl(logoUrl?: string | null): string | null {
    if (!logoUrl) {
      return null;
    }

    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }

    return `${this.backendBaseUrl}${logoUrl}`;
  }

  private buildFormData(payload: Partial<Organization>, logo?: File | null): FormData {
    const formData = new FormData();
    formData.append('name', payload.name?.trim() ?? '');
    formData.append('description', payload.description?.trim() ?? '');

    if (logo) {
      formData.append('logo', logo);
    }

    return formData;
  }
}
