import { Component } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent {
  users: User[] = [];
  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAll().subscribe(data => {
      this.users = data;
    });
  }

  deleteUser(id: number) {
    this.userService.delete(id).subscribe(() => {
      this.loadUsers();
    });
  }

}
