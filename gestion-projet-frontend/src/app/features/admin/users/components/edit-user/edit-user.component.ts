import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserService } from 'src/app/features/admin/users/services/user.service';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent {

  @Input()  user!: User;
  @Output() userUpdated = new EventEmitter<void>();
  @Output() close       = new EventEmitter<void>();

  loading    = false;
  successMsg = '';
  errorMsg   = '';

  constructor(private userService: UserService) {}

  update(): void {
    this.loading    = true;
    this.successMsg = '';
    this.errorMsg   = '';

    this.userService.update(this.user.id!, this.user).subscribe({
      next: () => {
        this.loading    = false;
        this.successMsg = 'User updated successfully!';
        setTimeout(() => {
          this.userUpdated.emit();
          this.close.emit();
        }, 1000);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'An error occurred. Please try again.';
      }
    });
  }

  cancel(): void {
    this.close.emit();
  }

  // Ferme le modal si on clique sur l'overlay (fond sombre)
  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('eu-overlay')) {
      this.close.emit();
    }
  }

  isCinValid(): boolean {
    return /^[01]\d{7}$/.test(String(this.user.cin ?? ''));
  }
}
