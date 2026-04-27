import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { RoleRedirectGuard } from './core/guards/role-redirect.guard';
import { AttachmentsComponent } from './features/admin/attachments/pages/attachments/attachments.component';
import { DashboardComponent } from './features/admin/dashboard/pages/dashboard/dashboard.component';
import { KanbanComponent } from './features/admin/kanban/pages/kanban/kanban.component';
import { NotificationsComponent } from './features/admin/notifications/pages/notifications/notifications.component';
import { OrganizationsComponent } from './features/admin/organizations/pages/organizations/organizations.component';
import { ProjectsComponent } from './features/admin/projects/pages/projects/projects.component';
import { TasksComponent } from './features/admin/tasks/pages/tasks/tasks.component';
import { AddUserComponent } from './features/admin/users/components/add-user/add-user.component';
import { UsersComponent } from './features/admin/users/pages/users/users.component';
import { FrontofficeDashboardComponent } from './features/frontoffice/dashboard/pages/frontoffice-dashboard/frontoffice-dashboard.component';
import { FrontofficeActivityComponent } from './features/frontoffice/activity/pages/frontoffice-activity/frontoffice-activity.component';
import { FrontofficeKanbanComponent } from './features/frontoffice/kanban/pages/frontoffice-kanban/frontoffice-kanban.component';
import { FrontofficeLayoutComponent } from './features/frontoffice/layout/frontoffice-layout.component';
import { FrontofficeMessagesComponent } from './features/frontoffice/messages/pages/frontoffice-messages/frontoffice-messages.component';
import { FrontofficeProfileComponent } from './features/frontoffice/profile/pages/frontoffice-profile/frontoffice-profile.component';
import { FrontofficeProjectsComponent } from './features/frontoffice/projects/pages/frontoffice-projects/frontoffice-projects.component';
import { FrontofficeSearchComponent } from './features/frontoffice/search/pages/frontoffice-search/frontoffice-search.component';
import { FrontofficeTasksComponent } from './features/frontoffice/tasks/pages/frontoffice-tasks/frontoffice-tasks.component';
import { AdminLayoutComponent } from './shared/layout/admin-layout/admin-layout.component';


const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', component: LoginComponent },
  {
    path: 'frontoffice',
    component: FrontofficeLayoutComponent,
    canActivate: [RoleRedirectGuard],
    canActivateChild: [RoleRedirectGuard],
    data: { area: 'frontoffice' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: FrontofficeDashboardComponent },
      { path: 'activity', component: FrontofficeActivityComponent },
      { path: 'projects', component: FrontofficeProjectsComponent },
      { path: 'projects/:id/kanban', component: FrontofficeKanbanComponent },
      { path: 'messages', component: FrontofficeMessagesComponent },
      { path: 'search', component: FrontofficeSearchComponent },
      { path: 'tasks', component: FrontofficeTasksComponent },
      { path: 'profile', component: FrontofficeProfileComponent }
    ]
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [RoleRedirectGuard],
    canActivateChild: [RoleRedirectGuard],
    data: { area: 'admin' },
    children: [
      { path: '', redirectTo: 'admin/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'admin/dashboard', component: DashboardComponent },
      { path: 'admin/users', component: UsersComponent },
      { path: 'admin/organizations', component: OrganizationsComponent },
      { path: 'admin/projects', component: ProjectsComponent },
      { path: 'admin/tasks', component: TasksComponent },
      { path: 'admin/attachments', component: AttachmentsComponent },
      { path: 'admin/notifications', component: NotificationsComponent },
      { path: 'users/add', component: AddUserComponent },
      { path: 'admin/projects/:id/kanban', component: KanbanComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
