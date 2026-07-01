import { Component } from '@angular/core';
import { LanguageService } from 'src/app/core/services/language.service';
import { SearchService } from 'src/app/core/services/search.service';
import { GlobalSearchResult } from 'src/app/shared/models/search.model';

@Component({
  selector: 'app-frontoffice-search',
  templateUrl: './frontoffice-search.component.html',
  styleUrls: ['./frontoffice-search.component.css']
})
export class FrontofficeSearchComponent {
  query = '';
  loading = false;
  errorMessage = '';
  results: GlobalSearchResult = { projects: [], tasks: [], users: [] };

  constructor(private lang: LanguageService, private searchService: SearchService) {}

  search(): void {
    const value = this.query.trim();
    if (value.length < 2) {
      this.results = { projects: [], tasks: [], users: [] };
      this.errorMessage = value ? this.lang.instant('search.minChars') : '';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.searchService.global(value).subscribe({
      next: (results) => {
        this.results = results;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.errorMessage = this.lang.instant('search.error');
      }
    });
  }

  get hasResults(): boolean {
    return this.results.projects.length > 0 || this.results.tasks.length > 0 || this.results.users.length > 0;
  }

  formatDate(value?: string): string {
    if (!value) return this.lang.instant('search.noDate');
    const date = new Date(value);
    if (isNaN(date.getTime())) return this.lang.instant('search.noDate');
    const locale = this.lang.current === 'en' ? 'en-US' : 'fr-FR';
    return date.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
