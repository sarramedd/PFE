import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { UsersComponent } from './pages/admin/users/users.component';
import { ProjectsComponent } from './pages/admin/projects/projects.component';
import { TasksComponent } from './pages/admin/tasks/tasks.component';
import { AttachmentsComponent } from './pages/admin/attachments/attachments.component';
import { NotificationsComponent } from './pages/admin/notifications/notifications.component';
import { LoginComponent } from './auth/login/login.component';

const routes: Routes = [{ path: '', component: DashboardComponent },
  { path: 'admin/users', component: UsersComponent },
  { path: 'admin/projects', component: ProjectsComponent },
  { path: 'admin/tasks', component: TasksComponent },
  { path: 'admin/attachments', component: AttachmentsComponent },
  { path: 'admin/notifications', component: NotificationsComponent },
   { path: 'login', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
