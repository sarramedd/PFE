import { Component } from '@angular/core';
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

  constructor(private searchService: SearchService) {}

  search(): void {
    const value = this.query.trim();
    if (value.length < 2) {
      this.results = { projects: [], tasks: [], users: [] };
      this.errorMessage = value ? 'Entre au moins 2 caracteres.' : '';
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
        this.errorMessage = 'Impossible de lancer la recherche globale.';
      }
    });
  }

  get hasResults(): boolean {
    return this.results.projects.length > 0 || this.results.tasks.length > 0 || this.results.users.length > 0;
  }

  formatDate(value?: string): string {
    if (!value) {
      return 'Sans date';
    }

    const date = new Date(value);
    return isNaN(date.getTime())
      ? 'Sans date'
      : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
}
