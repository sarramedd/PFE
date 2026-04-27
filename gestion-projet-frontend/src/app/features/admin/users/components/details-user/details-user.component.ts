import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from 'src/app/shared/models/user.model';

@Component({
  selector: 'app-details-user',
  templateUrl: './details-user.component.html',
  styleUrls: ['./details-user.component.css']
})
export class DetailsUserComponent {
   @Input()  user!: User;
  @Output() close    = new EventEmitter<void>();
  @Output() editUser = new EventEmitter<User>();
ngOnInit(): void {
  console.log('user createdAt:', this.user?.createdAt);
}
  onEdit(): void {
    this.editUser.emit(this.user);
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('ud-overlay')) {
      this.close.emit();
    }
  }
  formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

}
