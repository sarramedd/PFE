import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './core/auth/pages/login/login.component';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { AttachmentsComponent } from './features/admin/attachments/pages/attachments/attachments.component';
import { DashboardComponent } from './features/admin/dashboard/pages/dashboard/dashboard.component';
import { KanbanComponent } from './features/admin/kanban/pages/kanban/kanban.component';
import { NotificationsComponent } from './features/admin/notifications/pages/notifications/notifications.component';
import { OrganizationsComponent } from './features/admin/organizations/pages/organizations/organizations.component';
import { OrganizationPopupComponent } from './features/admin/organizations/components/organization-popup/organization-popup.component';
import { AddProjectComponent } from './features/admin/projects/components/add-project/add-project.component';
import { EditProjectComponent } from './features/admin/projects/components/edit-project/edit-project.component';
import { ManageMembersComponent } from './features/admin/projects/components/manage-members/manage-members.component';
import { ProjectsComponent } from './features/admin/projects/pages/projects/projects.component';
import { AddTaskComponent } from './features/admin/tasks/components/add-task/add-task.component';
import { EditTaskComponent } from './features/admin/tasks/components/edit-task/edit-task.component';
import { TasksComponent } from './features/admin/tasks/pages/tasks/tasks.component';
import { AddUserComponent } from './features/admin/users/components/add-user/add-user.component';
import { DetailsUserComponent } from './features/admin/users/components/details-user/details-user.component';
import { EditUserComponent } from './features/admin/users/components/edit-user/edit-user.component';
import { UsersComponent } from './features/admin/users/pages/users/users.component';
import { FrontofficeDashboardComponent } from './features/frontoffice/dashboard/pages/frontoffice-dashboard/frontoffice-dashboard.component';
import { FrontofficeActivityComponent } from './features/frontoffice/activity/pages/frontoffice-activity/frontoffice-activity.component';
import { FrontofficeKanbanComponent } from './features/frontoffice/kanban/pages/frontoffice-kanban/frontoffice-kanban.component';
import { FrontofficeTaskEditorComponent } from './features/frontoffice/kanban/components/frontoffice-task-editor/frontoffice-task-editor.component';
import { FrontofficeTaskFormComponent } from './features/frontoffice/kanban/components/frontoffice-task-form/frontoffice-task-form.component';
import { FoFooterComponent } from './features/frontoffice/layout/components/fo-footer/fo-footer.component';
import { FoNavbarComponent } from './features/frontoffice/layout/components/fo-navbar/fo-navbar.component';
import { FoSidebarComponent } from './features/frontoffice/layout/components/fo-sidebar/fo-sidebar.component';
import { FrontofficeLayoutComponent } from './features/frontoffice/layout/frontoffice-layout.component';
import { FrontofficeMessagesComponent } from './features/frontoffice/messages/pages/frontoffice-messages/frontoffice-messages.component';
import { FrontofficeProfileComponent } from './features/frontoffice/profile/pages/frontoffice-profile/frontoffice-profile.component';
import { FrontofficeProjectFormComponent } from './features/frontoffice/projects/components/frontoffice-project-form/frontoffice-project-form.component';
import { FrontofficeProjectsComponent } from './features/frontoffice/projects/pages/frontoffice-projects/frontoffice-projects.component';
import { FrontofficeSearchComponent } from './features/frontoffice/search/pages/frontoffice-search/frontoffice-search.component';
import { FrontofficeTasksComponent } from './features/frontoffice/tasks/pages/frontoffice-tasks/frontoffice-tasks.component';
import { FrontofficeTaskHubComponent } from './features/frontoffice/tasks/components/frontoffice-task-hub/frontoffice-task-hub.component';
import { AdminLayoutComponent } from './shared/layout/admin-layout/admin-layout.component';
import { FooterComponent } from './shared/layout/footer/footer.component';
import { NavbarComponent } from './shared/layout/navbar/navbar.component';
import { SidebarComponent } from './shared/layout/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    DashboardComponent,
    UsersComponent,
    ProjectsComponent,
    TasksComponent,
    AttachmentsComponent,
    NotificationsComponent,
    OrganizationsComponent,
    OrganizationPopupComponent,
    LoginComponent,
    AddUserComponent,
    EditUserComponent,
    DetailsUserComponent,
    AddProjectComponent,
    EditProjectComponent,
    ManageMembersComponent,
    KanbanComponent,
    AddTaskComponent,
    EditTaskComponent,
    AdminLayoutComponent,
    FrontofficeLayoutComponent,
    FoNavbarComponent,
    FoFooterComponent,
    FoSidebarComponent,
    FrontofficeDashboardComponent,
    FrontofficeActivityComponent,
    FrontofficeKanbanComponent,
    FrontofficeTaskEditorComponent,
    FrontofficeTaskFormComponent,
    FrontofficeProjectsComponent,
    FrontofficeProjectFormComponent,
    FrontofficeMessagesComponent,
    FrontofficeSearchComponent,
    FrontofficeTasksComponent,
    FrontofficeTaskHubComponent,
    FrontofficeProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [ { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule { }
