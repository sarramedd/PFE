import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { Organization } from 'src/app/shared/models/organization.model';

@Component({
  selector: 'app-organization-popup',
  templateUrl: './organization-popup.component.html',
  styleUrls: ['./organization-popup.component.css']
})
export class OrganizationPopupComponent implements OnChanges {
  @Input() organization: Organization | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  form: Partial<Organization> = { name: '', description: '' };
  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | null = null;
  isSaving = false;
  errorMessage = '';
  formSubmitted = false;

  constructor(private organizationService: OrganizationService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organization']) {
      this.form = {
        name: this.organization?.name ?? '',
        description: this.organization?.description ?? '',
        logoUrl: this.organization?.logoUrl
      };
      this.selectedLogoFile = null;
      this.logoPreviewUrl = this.organizationService.resolveLogoUrl(this.organization?.logoUrl);
      this.isSaving = false;
      this.errorMessage = '';
      this.formSubmitted = false;
    }
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('op-overlay')) {
      this.close.emit();
    }
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedLogoFile = file;

    if (!file) {
      this.logoPreviewUrl = this.organizationService.resolveLogoUrl(this.form.logoUrl);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.logoPreviewUrl = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  save(): void {
    this.formSubmitted = true;

    if (!this.form.name?.trim() || this.form.name.trim().length < 2 || !this.hasValidDescription() || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    const request$ = this.organization?.id
      ? this.organizationService.update(this.organization.id, this.form, this.selectedLogoFile)
      : this.organizationService.create(this.form, this.selectedLogoFile);

    request$.subscribe({
      next: () => {
        this.isSaving = false;
        this.saved.emit();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'Operation impossible.';
      }
    });
  }

  hasValidDescription(): boolean {
    return (this.form.description?.trim().length ?? 0) <= 300;
  }
}
