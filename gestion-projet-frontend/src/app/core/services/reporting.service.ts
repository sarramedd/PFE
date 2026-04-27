import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportingService {
  private readonly apiUrl = 'http://localhost:8088/api/reports';

  constructor(private http: HttpClient) {}

  getKpiSummary(): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.apiUrl}/kpi`);
  }

  getWeeklyLoad(startDate?: string, endDate?: string): Observable<Array<Record<string, unknown>>> {
    const suffix = this.buildDateSuffix(startDate, endDate);
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/weekly-load${suffix}`);
  }

  getEffortSummary(): Observable<Array<Record<string, unknown>>> {
    return this.http.get<Array<Record<string, unknown>>>(`${this.apiUrl}/effort-summary`);
  }

  exportKpiCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/kpi.csv`, { responseType: 'blob' });
  }

  exportKpiXlsx(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/kpi.xlsx`, { responseType: 'blob' });
  }

  exportKpiPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/kpi.pdf`, { responseType: 'blob' });
  }

  exportMemberLoadCsv(startDate?: string, endDate?: string): Observable<Blob> {
    const suffix = this.buildDateSuffix(startDate, endDate);
    return this.http.get(`${this.apiUrl}/member-load.csv${suffix}`, { responseType: 'blob' });
  }

  exportMemberLoadXlsx(startDate?: string, endDate?: string): Observable<Blob> {
    const suffix = this.buildDateSuffix(startDate, endDate);
    return this.http.get(`${this.apiUrl}/member-load.xlsx${suffix}`, { responseType: 'blob' });
  }

  exportMemberLoadPdf(startDate?: string, endDate?: string): Observable<Blob> {
    const suffix = this.buildDateSuffix(startDate, endDate);
    return this.http.get(`${this.apiUrl}/member-load.pdf${suffix}`, { responseType: 'blob' });
  }

  exportEffortSummaryCsv(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/effort-summary.csv`, { responseType: 'blob' });
  }

  exportEffortSummaryXlsx(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/effort-summary.xlsx`, { responseType: 'blob' });
  }

  exportEffortSummaryPdf(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/effort-summary.pdf`, { responseType: 'blob' });
  }

  private buildDateSuffix(startDate?: string, endDate?: string): string {
    const params = new URLSearchParams();
    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }
    return params.toString() ? `?${params.toString()}` : '';
  }
}
