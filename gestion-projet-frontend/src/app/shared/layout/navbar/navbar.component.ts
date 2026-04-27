import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  readonly user$: Observable<User | null>;
  organizationName = 'Organization Workspace';
  organizationLogoUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private currentUserService: CurrentUserService,
    private organizationService: OrganizationService,
    private router: Router
  ) {
    this.user$ = this.currentUserService.user$;
  }

  ngOnInit(): void {
    this.currentUserService.refresh().subscribe((user) => {
      if (user?.organizationName) {
        this.organizationName = user.organizationName;
      }

      const fromUser = this.organizationService.resolveLogoUrl(user?.organizationLogoUrl);
      if (fromUser) {
        this.organizationLogoUrl = fromUser;
        return;
      }

      const organizationId = this.authService.getOrganizationId();
      if (!organizationId || this.authService.isSuperAdmin()) {
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

  get organizationLogo(): string {
    return this.organizationLogoUrl || 'assets/images/teamflow.png';
  }

  avatarUrl(user: User): string | null {
    if (!user.avatarUrl) {
      return null;
    }

    if (user.avatarUrl.startsWith('http://') || user.avatarUrl.startsWith('https://')) {
      return user.avatarUrl;
    }

    return `http://localhost:8088${user.avatarUrl}`;
  }

  initials(user: User): string {
    const first = user.firstName?.charAt(0) || 'U';
    const last = user.lastName?.charAt(0) || 'S';
    return `${first}${last}`.toUpperCase();
  }

  logout(): void {
    this.authService.logout();
    this.currentUserService.clear();
    this.router.navigateByUrl('/login');
  }
}
