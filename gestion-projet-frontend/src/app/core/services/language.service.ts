import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export type Lang = 'fr' | 'en';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'tf_lang';
  private translations: Record<string, any> = {};
  private lang$ = new BehaviorSubject<Lang>(this.savedLang());

  readonly currentLang$ = this.lang$.asObservable();

  get current(): Lang { return this.lang$.value; }

  constructor(private http: HttpClient) {}

  /** Appelé par APP_INITIALIZER — bloque le rendu jusqu'à ce que les traductions soient prêtes. */
  init(): Promise<void> {
    return new Promise(resolve => {
      this.loadTranslations(this.current).subscribe({
        next: () => resolve(),
        error: () => resolve()   // ne bloque pas l'app si le JSON est absent
      });
    });
  }

  use(lang: Lang): void {
    if (lang === this.current) return;
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.loadTranslations(lang).subscribe(() => this.lang$.next(lang));
  }

  instant(key: string): string {
    const parts = key.split('.');
    let node: any = this.translations;
    for (const part of parts) {
      if (node == null || typeof node !== 'object') return key;
      node = node[part];
    }
    return typeof node === 'string' ? node : key;
  }

  private loadTranslations(lang: Lang): Observable<any> {
    return this.http.get<any>(`assets/i18n/${lang}.json`).pipe(
      tap(data => { this.translations = data; }),
      catchError(() => of({}))
    );
  }

  private savedLang(): Lang {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved === 'en' ? 'en' : 'fr';
  }
}
