import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent {

  @Output() userAdded = new EventEmitter<void>();
  @Output() close     = new EventEmitter<void>();

  // Roles disponibles — labels affichés + valeurs envoyées au backend
  roles = [
    { value: 'ADMIN',           label: 'Admin' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'MEMBER',          label: 'Member' }
  ];

  user = {
    firstName : '',
    lastName  : '',
    cin       : null as number | null,
    email     : '',
    password  : '',
    role      : '' as string   // sera 'ADMIN' | 'PROJECT_MANAGER' | 'MEMBER'
  };

  loading      = false;
  showPassword = false;
  successMsg   = '';
  errorMsg     = '';
  formSubmitted = false;

  constructor(private userService: UserService) {}

  addUser(): void {
    this.formSubmitted = true;

    if (!this.user.role) return;   // sécurité si le rôle n'est pas sélectionné

    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    this.userService.create(this.user).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'User created successfully!';
        setTimeout(() => {
          this.userAdded.emit();
          this.close.emit();
        }, 1000);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'An error occurred. Please try again.';
      }
    });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('au-overlay')) {
      this.close.emit();
    }
  }
}