import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { Role, User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  showEditModal = false;
  showAddModal = false;
  showDetailsModal = false;
  detailsUser: User | null = null;
  isSuperAdmin = false;
  currentOrganizationName = 'My organization';
  currentOrganizationLogoUrl: string | null = null;

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isSuperAdmin = this.authService.isSuperAdmin();
    this.loadUsers();
    this.loadOrganizationBranding();
  }

  get activeCount(): number {
    return this.users.filter((u) => u.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter((u) => !u.isActive).length;
  }

  loadUsers(): void {
    this.userService.getAll().subscribe((data) => {
      this.users = data.map((u) => ({
        id: u.id,
        firstName: u.firstName ?? '-',
        lastName: u.lastName ?? '-',
        email: u.email ?? '-',
        role: u.role ?? Role.MEMBER,
        cin: u.cin ?? 0,
        isActive: u.isActive ?? true,
        createdAt: u.createdAt,
        password: u.password,
        avatarUrl: u.avatarUrl,
        organizationId: u.organizationId,
        organizationName: u.organizationName,
        organizationLogoUrl: (u as any).organizationLogoUrl ?? (u as any).organization?.logoUrl
      }));

      if (!this.isSuperAdmin) {
        this.currentOrganizationName = this.users.find((user) => !!user.organizationName)?.organizationName || this.currentOrganizationName;
        this.currentOrganizationLogoUrl = this.organizationService.resolveLogoUrl(
          this.users.find((user) => !!user.organizationLogoUrl)?.organizationLogoUrl
        );
      }
    });
  }

  loadOrganizationBranding(): void {
    if (this.isSuperAdmin) {
      this.currentOrganizationName = 'All organizations';
      this.currentOrganizationLogoUrl = null;
      return;
    }

    const organizationId = this.authService.getOrganizationId();
    if (!organizationId) {
      return;
    }

    if (this.currentOrganizationLogoUrl) {
      return;
    }

    this.organizationService.getMine().subscribe({
      next: (organization) => {
        if (!organization || organization.id !== organizationId) {
          return;
        }

        this.currentOrganizationName = organization.name;
        this.currentOrganizationLogoUrl = this.organizationService.resolveLogoUrl(organization.logoUrl);
      },
      error: () => {
        this.currentOrganizationLogoUrl = null;
      }
    });
  }

  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    this.userService.delete(id).subscribe(() => {
      this.loadUsers();
    });
  }

  toggleUserStatus(user: User): void {
    if (user.isActive) {
      this.userService.deactivateUser(user.id).subscribe(() => {
        user.isActive = false;
      });
    } else {
      this.userService.activateUser(user.id).subscribe(() => {
        user.isActive = true;
      });
    }
  }

  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onUserUpdated(): void {
    this.closeEditModal();
    this.loadUsers();
  }

  onUserAdded(): void {
    this.closeAddModal();
    this.loadUsers();
  }

  openDetailsModal(user: User): void {
    this.detailsUser = user;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.detailsUser = null;
  }

  getAvatarUrl(user: User): string | null {
    return this.userService.resolveAvatarUrl(user.avatarUrl);
  }

  get organizationLogo(): string {
    return this.currentOrganizationLogoUrl || 'assets/images/teamflow.png';
  }
}
