import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User, Role } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  showEditModal = false;
  showAddModal = false;
  showDetailsModal = false;
detailsUser: User | null = null;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── Stats getters ──────────────────────────────────────
  get activeCount(): number {
    return this.users.filter(u => u.isActive).length;
  }

  get inactiveCount(): number {
    return this.users.filter(u => !u.isActive).length;
  }

  // ── Load users safely ───────────────────────────────────
  loadUsers(): void {
    this.userService.getAll().subscribe(data => {
      this.users = data.map(u => ({
        id: u.id,
        firstName: u.firstName ?? '—',
        lastName: u.lastName ?? '—',
        email: u.email ?? '—',
        role: u.role ?? Role.USER,
        cin: u.cin ?? 0,
        isActive: u.isActive ?? true,
        createdAt: u.createdAt,
        password: u.password
      }));
    });
  }

  // ── Delete user ───────────────────────────────────────
  deleteUser(id: number): void {
    if (!confirm('Are you sure you want to delete this user?')) return;
    this.userService.delete(id).subscribe(() => {
      this.loadUsers();
    });
  }

  // ── Toggle status ─────────────────────────────────────
  toggleUserStatus(user: User): void {
    if (user.isActive) {
      this.userService.deactivateUser(user.id).subscribe(() => { user.isActive = false; });
    } else {
      this.userService.activateUser(user.id).subscribe(() => { user.isActive = true; });
    }
  }

  // ── Modals ───────────────────────────────────────────
  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  onUserUpdated(): void {
    this.closeEditModal();
    this.loadUsers();
  }

  onUserAdded(): void {
    this.closeAddModal();
    this.loadUsers();
  }
  openDetailsModal(user: User): void {
  this.detailsUser = user;
  this.showDetailsModal = true;
}

closeDetailsModal(): void {
  this.showDetailsModal = false;
  this.detailsUser = null;
}
}