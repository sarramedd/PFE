import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
   email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService,
              private router: Router) {}

  login() {
    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        console.log("login marche") ;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = "Email ou mot de passe incorrect.";
      }
    });
  }

}
