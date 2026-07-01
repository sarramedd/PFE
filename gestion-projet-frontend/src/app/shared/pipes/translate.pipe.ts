import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from 'src/app/core/services/language.service';

@Pipe({ name: 'tf', pure: false, standalone: true })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private sub: Subscription;
  private lastKey = '';
  private lastValue = '';

  constructor(private langService: LanguageService, private cd: ChangeDetectorRef) {
    this.sub = this.langService.currentLang$.subscribe(() => {
      this.lastKey = '';    // force re-render
      this.cd.markForCheck();
    });
  }

  transform(key: string): string {
    if (!key) return '';
    if (key !== this.lastKey) {
      this.lastKey  = key;
      this.lastValue = this.langService.instant(key);
    }
    return this.lastValue;
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }
}
