import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { Role, User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  organizationName = 'Organization Workspace';
  organizationLogoUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private currentUserService: CurrentUserService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.currentUserService.refresh().subscribe((user) => {
      this.currentUser = user;
      if (user?.organizationName) {
        this.organizationName = user.organizationName;
      }

      const fromUser = this.organizationService.resolveLogoUrl(user?.organizationLogoUrl);
      if (fromUser) {
        this.organizationLogoUrl = fromUser;
        return;
      }

      const organizationId = this.authService.getOrganizationId();
      if (!organizationId || this.isSuperAdmin) {
        return;
      }

      this.organizationService.getMine().subscribe({
        next: (organization) => {
          if (!organization || organization.id !== organizationId) {
            return;
          }

          this.organizationName = organization.name || this.organizationName;
          this.organizationLogoUrl = this.organizationService.resolveLogoUrl(organization.logoUrl);
        },
        error: () => {
          this.organizationLogoUrl = null;
        }
      });
    });
  }

  get isSuperAdmin(): boolean {
    return this.authService.isSuperAdmin();
  }

  get isOrganizationAdmin(): boolean {
    return this.authService.getRole() === Role.ORGANIZATION_ADMIN;
  }

  get profileName(): string {
    if (!this.currentUser) {
      return 'Admin';
    }

    return `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
  }

  get profileRoleLabel(): string {
    const role = this.currentUser?.role || this.authService.getRole();

    switch (role) {
      case Role.SUPER_ADMIN:
        return 'Super Administrator';
      case Role.ORGANIZATION_ADMIN:
        return 'Organization Admin';
      case Role.PROJECT_MANAGER:
        return 'Project Manager';
      default:
        return 'Member';
    }
  }

  get userAvatar(): string | null {
    if (!this.currentUser?.avatarUrl) {
      return null;
    }

    return this.currentUser.avatarUrl.startsWith('http')
      ? this.currentUser.avatarUrl
      : `http://localhost:8088${this.currentUser.avatarUrl}`;
  }

  get organizationLogo(): string {
    return this.organizationLogoUrl || 'assets/images/teamflow.png';
  }

  get userInitials(): string {
    const first = this.currentUser?.firstName?.charAt(0) || 'A';
    const last = this.currentUser?.lastName?.charAt(0) || 'D';
    return `${first}${last}`.toUpperCase();
  }
}
