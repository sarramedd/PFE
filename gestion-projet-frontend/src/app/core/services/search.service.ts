import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GlobalSearchResult } from 'src/app/shared/models/search.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly apiUrl = '/api/search';

  constructor(private http: HttpClient) {}

  global(query: string): Observable<GlobalSearchResult> {
    return this.http.get<GlobalSearchResult>(`${this.apiUrl}/global?q=${encodeURIComponent(query)}`);
  }
}
