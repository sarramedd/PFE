import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { Organization } from 'src/app/shared/models/organization.model';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-frontoffice-profile',
  templateUrl: './frontoffice-profile.component.html',
  styleUrls: ['./frontoffice-profile.component.css']
})
export class FrontofficeProfileComponent implements OnInit {
  user: User | null = null;
  currentOrganization: Organization | null = null;
  currentOrganizationLogoFromUser: string | null = null;
  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string | null = null;
  form = {
    firstName: '',
    lastName: '',
    email: '',
    cin: null as number | null,
    password: ''
  };
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private currentUserService: CurrentUserService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.currentUserService.user$.subscribe((user) => {
      this.user = user;
      this.isLoading = false;

      if (user) {
        this.avatarPreviewUrl = user.avatarUrl ? `http://localhost:8088${user.avatarUrl}` : null;
        this.currentOrganizationLogoFromUser = this.organizationService.resolveLogoUrl(user.organizationLogoUrl);
        this.loadOrganization(user.organizationId);
        this.form = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          cin: user.cin ?? null,
          password: ''
        };
      }
    });

    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }
  }

  saveProfile(): void {
    if (!this.user || this.isSaving || !this.isCinValid() || !this.hasValidPassword()) {
      return;
    }

    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.currentUserService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      cin: this.form.cin,
      password: this.form.password.trim() || undefined
    }, this.selectedAvatarFile).subscribe({
      next: () => {
        this.form.password = '';
        this.selectedAvatarFile = null;
        this.isSaving = false;
        this.successMessage = 'Profil mis a jour avec succes.';
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'La mise a jour du profil a echoue.';
      }
    });
  }

  isCinValid(): boolean {
    if (this.form.cin == null) {
      return true;
    }

    return /^[01]\d{7}$/.test(String(this.form.cin));
  }

  hasValidPassword(): boolean {
    return !this.form.password.trim() || this.form.password.trim().length >= 8;
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedAvatarFile = file;

    if (!file) {
      this.avatarPreviewUrl = this.user?.avatarUrl ? `http://localhost:8088${this.user.avatarUrl}` : null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreviewUrl = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  get organizationLogoUrl(): string {
    return this.currentOrganizationLogoFromUser || this.organizationService.resolveLogoUrl(this.currentOrganization?.logoUrl) || 'assets/images/teamflow.png';
  }

  private loadOrganization(organizationId?: number): void {
    if (!organizationId) {
      this.currentOrganization = null;
      return;
    }

    this.organizationService.getMine().subscribe({
      next: (organization) => {
        this.currentOrganization = organization?.id === organizationId ? organization : null;
      },
      error: () => {
        this.currentOrganization = null;
      }
    });
  }
}
