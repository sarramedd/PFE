import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { Organization } from 'src/app/shared/models/organization.model';
import { Role } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  @Output() userAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  roles: Array<{ value: string; label: string }> = [];

  organizations: Organization[] = [];
  isSuperAdmin = false;
  isOrganizationAdmin = false;
  modalSubtitle = 'Fill in the details to create an account';

  user = {
    firstName: '',
    lastName: '',
    cin: null as number | null,
    email: '',
    password: '',
    role: '' as string,
    organizationId: null as number | null
  };
  selectedAvatarFile: File | null = null;
  avatarPreviewUrl: string | null = null;

  loading = false;
  showPassword = false;
  successMsg = '';
  errorMsg = '';
  formSubmitted = false;
  readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.isOrganizationAdmin = this.authService.getRole() === Role.ORGANIZATION_ADMIN;

    if (this.isSuperAdmin) {
      this.roles = [
        { value: 'ORGANIZATION_ADMIN', label: 'Organization Admin' },
        { value: 'PROJECT_MANAGER', label: 'Project Manager' },
        { value: 'MEMBER', label: 'Member' }
      ];
      this.modalSubtitle = 'Create a user and assign an organization.';
    } else if (this.isOrganizationAdmin) {
      this.roles = [
        { value: 'PROJECT_MANAGER', label: 'Project Manager' },
        { value: 'MEMBER', label: 'Member' }
      ];
      this.modalSubtitle = 'Add members for your organization.';
    } else {
      this.roles = [
        { value: 'ADMIN', label: 'Admin' },
        { value: 'PROJECT_MANAGER', label: 'Project Manager' },
        { value: 'MEMBER', label: 'Member' }
      ];
    }

    if (this.isSuperAdmin) {
      this.organizationService.getAll().subscribe({
        next: (organizations) => {
          this.organizations = organizations;
        },
        error: () => {
          this.errorMsg = 'Unable to load organizations.';
        }
      });
    }
  }

  addUser(): void {
    this.formSubmitted = true;

    if (!this.user.role || !this.isCinValid() || !this.hasValidPassword() || !this.hasValidEmail()) {
      return;
    }

    if (this.isSuperAdmin && !this.user.organizationId) {
      return;
    }

    this.loading = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.userService.create(this.user, this.selectedAvatarFile).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'User created successfully!';
        setTimeout(() => {
          this.userAdded.emit();
          this.close.emit();
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'An error occurred. Please try again.';
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('au-overlay')) {
      this.close.emit();
    }
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedAvatarFile = file;

    if (!file) {
      this.avatarPreviewUrl = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreviewUrl = typeof reader.result === 'string' ? reader.result : null;
    };
    reader.readAsDataURL(file);
  }

  isCinValid(): boolean {
    return /^[01]\d{7}$/.test(String(this.user.cin ?? ''));
  }

  hasValidEmail(): boolean {
    return this.emailPattern.test(this.user.email.trim());
  }

  hasValidPassword(): boolean {
    return this.user.password.trim().length >= 8;
  }
}
