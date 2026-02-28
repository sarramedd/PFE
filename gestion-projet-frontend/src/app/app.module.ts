import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { ProjectsComponent } from './pages/admin/projects/projects.component';
import { TasksComponent } from './pages/admin/tasks/tasks.component';
import { AttachmentsComponent } from './pages/admin/attachments/attachments.component';
import { NotificationsComponent } from './pages/admin/notifications/notifications.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { LoginComponent } from './auth/login/login.component';
import { FormsModule } from '@angular/forms';

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
    LoginComponent
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
