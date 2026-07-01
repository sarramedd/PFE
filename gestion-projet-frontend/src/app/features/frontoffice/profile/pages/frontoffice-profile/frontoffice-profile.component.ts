import { Component, OnInit } from '@angular/core';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { LanguageService } from 'src/app/core/services/language.service';
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
    oldPassword: '',
    password: ''
  };

  confirmPassword = '';
  showOldPassword = false;
  showPassword = false;
  showConfirmPassword = false;

  isLoading = true;
  isSavingProfile = false;
  isSavingPassword = false;

  profileSuccess = '';
  profileError = '';
  passwordSuccess = '';
  passwordError = '';

  constructor(
    private currentUserService: CurrentUserService,
    private lang: LanguageService,
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
          oldPassword: '',
          password: ''
        };
      }
    });

    if (!this.currentUserService.snapshot) {
      this.currentUserService.refresh().subscribe();
    }
  }

  // ─── Profile info ────────────────────────────────────────────
  saveProfile(): void {
    if (!this.user || this.isSavingProfile || !this.isCinValid()) return;

    this.isSavingProfile = true;
    this.profileSuccess = '';
    this.profileError = '';

    this.currentUserService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      cin: this.form.cin,
      password: undefined
    }, this.selectedAvatarFile).subscribe({
      next: () => {
        this.selectedAvatarFile = null;
        this.isSavingProfile = false;
        this.profileSuccess = this.lang.instant('profile.saveSuccess');
        setTimeout(() => this.profileSuccess = '', 4000);
      },
      error: () => {
        this.isSavingProfile = false;
        this.profileError = this.lang.instant('profile.saveError');
        setTimeout(() => this.profileError = '', 4000);
      }
    });
  }

  // ─── Password change ─────────────────────────────────────────
  get passwordStrength(): { level: string; percent: number; label: string; color: string } {
    const pwd = this.form.password;
    if (!pwd) return { level: 'none', percent: 0, label: '', color: '' };

    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 'weak',   percent: 33,  label: 'profile.strengthWeak',   color: 'danger'  };
    if (score <= 3) return { level: 'fair',   percent: 66,  label: 'profile.strengthFair',   color: 'warning' };
    return             { level: 'strong', percent: 100, label: 'profile.strengthStrong', color: 'success' };
  }

  canChangePassword(): boolean {
    const old = this.form.oldPassword.trim();
    const pwd = this.form.password.trim();
    return old.length >= 1 && pwd.length >= 8 && pwd === this.confirmPassword;
  }

  changePassword(): void {
    if (!this.canChangePassword() || this.isSavingPassword) return;

    this.isSavingPassword = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    this.currentUserService.updateProfile({
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      email: this.form.email,
      cin: this.form.cin,
      oldPassword: this.form.oldPassword.trim(),
      password: this.form.password.trim()
    }, null).subscribe({
      next: () => {
        this.form.oldPassword = '';
        this.form.password = '';
        this.confirmPassword = '';
        this.showOldPassword = false;
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.isSavingPassword = false;
        this.passwordSuccess = this.lang.instant('profile.passwordSuccess');
        setTimeout(() => this.passwordSuccess = '', 4000);
      },
      error: (err) => {
        this.isSavingPassword = false;
        const msg: string = err?.error?.message ?? '';
        this.passwordError = msg.toLowerCase().includes('incorrect')
          ? this.lang.instant('profile.oldPasswordError')
          : this.lang.instant('profile.saveError');
        setTimeout(() => this.passwordError = '', 5000);
      }
    });
  }

  isCinValid(): boolean {
    if (this.form.cin == null) return true;
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
    return this.currentOrganizationLogoFromUser
      || this.organizationService.resolveLogoUrl(this.currentOrganization?.logoUrl)
      || 'assets/images/teamflow.png';
  }

  private loadOrganization(organizationId?: number): void {
    if (!organizationId) { this.currentOrganization = null; return; }

    this.organizationService.getMine().subscribe({
      next: (organization) => {
        this.currentOrganization = organization?.id === organizationId ? organization : null;
      },
      error: () => { this.currentOrganization = null; }
    });
  }
}
