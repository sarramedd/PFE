import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Lang, LanguageService } from 'src/app/core/services/language.service';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tf-lang-switcher">
      <button class="tf-lang-btn"
              [class.active]="current === 'fr'"
              (click)="use('fr')"
              title="Français">
        <span class="tf-lang-flag">🇫🇷</span>
        <span class="tf-lang-label">FR</span>
      </button>
      <span class="tf-lang-divider">|</span>
      <button class="tf-lang-btn"
              [class.active]="current === 'en'"
              (click)="use('en')"
              title="English">
        <span class="tf-lang-flag">🇬🇧</span>
        <span class="tf-lang-label">EN</span>
      </button>
    </div>
  `,
  styles: [`
    .tf-lang-switcher {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      background: rgba(99,102,241,0.08);
      border: 1px solid rgba(99,102,241,0.18);
      border-radius: 999px;
      padding: 3px 8px;
    }
    .tf-lang-btn {
      display: flex; align-items: center; gap: 4px;
      background: none; border: none; cursor: pointer;
      padding: 4px 8px; border-radius: 999px;
      font-size: 12px; font-weight: 600;
      color: #94a3b8;
      transition: all .15s;
    }
    .tf-lang-btn:hover { color: #6366f1; background: rgba(99,102,241,0.1); }
    .tf-lang-btn.active {
      color: #6366f1;
      background: rgba(99,102,241,0.15);
      font-weight: 800;
    }
    .tf-lang-flag { font-size: 14px; line-height: 1; }
    .tf-lang-divider { color: #cbd5e1; font-size: 11px; user-select: none; }
  `]
})
export class LangSwitcherComponent {
  get current(): Lang { return this.langService.current; }
  constructor(private langService: LanguageService) {}
  use(lang: Lang): void { this.langService.use(lang); }
}
