import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Project } from 'src/app/models/project';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/user';
import { ProjectMemberService } from 'src/app/services/projectMember.service';
import { ProjectMember } from 'src/app/models/projectmember';

@Component({
  selector: 'app-manage-members',
  templateUrl: './manage-members.component.html',
  styleUrls: ['./manage-members.component.css']
})
export class ManageMembersComponent implements OnInit {

  @Input()  project!: Project;
  @Output() close = new EventEmitter<void>();

  members: ProjectMember[] = [];
  allUsers: User[]         = [];
  filteredUsers: User[]    = [];

  selectedUserId: number | null = null;
  selectedRole   = 'MEMBER';
  searchQuery    = '';

  loading    = false;
  errorMsg   = '';
  successMsg = '';

  roles = [
   
    { value: 'PROJECT_MANAGER', label: 'Project Manager' },
    { value: 'MEMBER',          label: 'Member' }
  ];

  constructor(
    private memberService: ProjectMemberService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // ✅ FIX: charge members FIRST, then users
    // so filterUsers() correctly excludes already-added members
    this.memberService.getMembers(this.project.id).subscribe(data => {
      this.members = data;
      this.userService.getAll().subscribe(users => {
        this.allUsers = users;
        this.filterUsers();
      });
    });
  }

  filterUsers(): void {
  console.log('allUsers:', this.allUsers);
  console.log('members:', this.members);
  console.log('memberUserIds:', this.members.map(m => m.user.id));

  const memberUserIds = this.members.map(m => m.user.id);
  const query = this.searchQuery.toLowerCase().trim();

  this.filteredUsers = this.allUsers
    .filter(u => !memberUserIds.includes(u.id))
    .filter(u => {
      if (!query) return false;
      return `${u.firstName} ${u.lastName} ${u.email}`
        .toLowerCase()
        .includes(query);
    });
}

  onSearch(): void {
    if (this.searchQuery === '') {
      this.selectedUserId = null;
    }
    this.filterUsers();
  }

  selectUser(user: User): void {
    this.selectedUserId = user.id;
    this.searchQuery    = `${user.firstName} ${user.lastName}`;
    this.filteredUsers  = [];
  }

  addMember(): void {
    if (!this.selectedUserId) return;
    this.loading    = true;
    this.errorMsg   = '';
    this.successMsg = '';

    this.memberService.addMember(this.project.id, this.selectedUserId, this.selectedRole).subscribe({
      next: () => {
        this.loading        = false;
        this.successMsg     = 'Member added successfully!';
        this.selectedUserId = null;
        this.selectedRole   = 'MEMBER';
        this.searchQuery    = '';
        this.filteredUsers  = [];
        this.memberService.getMembers(this.project.id).subscribe(data => {
          this.members = data;
          this.filterUsers();
        });
        setTimeout(() => this.successMsg = '', 2500);
      },
      error: (err) => {
        this.loading  = false;
        this.errorMsg = err?.error?.message ?? 'Failed to add member.';
      }
    });
  }

  updateRole(member: ProjectMember, newRole: string): void {
    this.memberService.updateRole(this.project.id, member.user.id, newRole).subscribe({
      next: () => { member.roleInProject = newRole; },
      error: () => {}
    });
  }

  removeMember(member: ProjectMember): void {
    if (!confirm(`Remove ${member.user.firstName} ${member.user.lastName} from this project?`)) return;
    this.memberService.removeMember(this.project.id, member.user.id).subscribe({
      next: () => {
        this.members = this.members.filter(m => m.id !== member.id);
        this.filterUsers();
      },
      error: () => {}
    });
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
    
      PROJECT_MANAGER: 'role-pm',
      MEMBER:          'role-member'
    };
    return map[role] ?? 'role-member';
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('mm-overlay')) {
      this.close.emit();
    }
  }
}