import { Component, OnInit } from '@angular/core';
import { OrganizationService } from 'src/app/features/admin/organizations/services/organization.service';
import { Organization } from 'src/app/shared/models/organization.model';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  styleUrls: ['./organizations.component.css']
})
export class OrganizationsComponent implements OnInit {
  organizations: Organization[] = [];
  selectedOrganization: Organization | null = null;
  showOrganizationPopup = false;
  errorMessage = '';
  successMessage = '';

  constructor(private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.organizationService.getAll().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les organisations.';
      }
    });
  }

  get totalOrganizations(): number {
    return this.organizations.length;
  }

  get organizationsWithLogo(): number {
    return this.organizations.filter((organization) => !!organization.logoUrl).length;
  }

  get totalUsers(): number {
    return this.organizations.reduce((sum, organization) => sum + (organization.userCount ?? 0), 0);
  }

  openCreateModal(): void {
    this.selectedOrganization = null;
    this.errorMessage = '';
    this.showOrganizationPopup = true;
  }

  editOrganization(organization: Organization): void {
    this.selectedOrganization = organization;
    this.errorMessage = '';
    this.successMessage = '';
    this.showOrganizationPopup = true;
  }

  closePopup(): void {
    this.showOrganizationPopup = false;
    this.selectedOrganization = null;
  }

  getLogoUrl(organization: Organization): string | null {
    return this.organizationService.resolveLogoUrl(organization.logoUrl);
  }

  onOrganizationSaved(): void {
    this.successMessage = this.selectedOrganization ? 'Organisation mise a jour.' : 'Organisation creee.';
    this.closePopup();
    this.loadOrganizations();
  }

  deleteOrganization(organization: Organization): void {
    if (!confirm(`Supprimer l'organisation ${organization.name} ?`)) {
      return;
    }

    this.organizationService.delete(organization.id).subscribe({
      next: () => {
        this.successMessage = 'Organisation supprimee.';
        this.loadOrganizations();
      },
      error: () => {
        this.errorMessage = 'Suppression impossible.';
      }
    });
  }
}
