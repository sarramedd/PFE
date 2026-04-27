import { Component, OnInit } from '@angular/core';
import { AuditLogService } from 'src/app/core/services/audit-log.service';
import { AuditLogItem } from 'src/app/shared/models/audit-log.model';
import { Role } from 'src/app/shared/models/user.model';
import { CurrentUserService } from 'src/app/core/services/current-user.service';

@Component({
  selector: 'app-frontoffice-activity',
  templateUrl: './frontoffice-activity.component.html',
  styleUrls: ['./frontoffice-activity.component.css']
})
export class FrontofficeActivityComponent implements OnInit {
  myLogs: AuditLogItem[] = [];
  teamLogs: AuditLogItem[] = [];
  loading = true;
  role: Role | null = null;

  constructor(
    private auditLogService: AuditLogService,
    private currentUserService: CurrentUserService
  ) {}

  ngOnInit(): void {
    this.role = this.currentUserService.snapshot?.role ?? null;

    this.auditLogService.getMine().subscribe({
      next: (logs) => {
        this.myLogs = logs.slice(0, 12);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

    if (this.role === Role.PROJECT_MANAGER || this.role === Role.ADMIN || this.role === Role.ORGANIZATION_ADMIN || this.role === Role.SUPER_ADMIN) {
      this.auditLogService.getTeam().subscribe({
        next: (logs) => {
          this.teamLogs = logs.slice(0, 12);
        }
      });
    }
  }

  get canSeeTeamActivity(): boolean {
    return this.role === Role.PROJECT_MANAGER
      || this.role === Role.ADMIN
      || this.role === Role.ORGANIZATION_ADMIN
      || this.role === Role.SUPER_ADMIN;
  }

  formatDate(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }

  formatAction(action: string): string {
    return action.replaceAll('_', ' ');
  }
}
