import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-fo-sidebar',
  templateUrl: './fo-sidebar.component.html',
  styleUrls: ['./fo-sidebar.component.css']
})
export class FoSidebarComponent {
  constructor(private authService: AuthService) {}

  get isAdmin(): boolean {
    return this.authService.isAdminUser();
  }
}
