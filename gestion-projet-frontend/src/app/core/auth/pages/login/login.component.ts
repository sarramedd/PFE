import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { CurrentUserService } from 'src/app/core/services/current-user.service';
import { ThemeAssetsService } from 'src/app/core/services/theme-assets.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  email = '';
  password = '';
  errorMessage = '';
  assetsReady = false;
  isSubmitting = false;

  showForgotPassword = false;
  forgotEmail = '';
  verificationCode = '';
  newPassword = '';
  forgotMessage = '';
  forgotError = '';
  forgotStep: 'request' | 'verify' | 'reset' = 'request';
  isRequestingReset = false;
  isVerifyingCode = false;
  isResettingPassword = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private currentUserService: CurrentUserService,
    private themeAssetsService: ThemeAssetsService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.themeAssetsService.load('auth');
    this.assetsReady = true;
  }

  ngOnDestroy(): void {
    this.themeAssetsService.unload('auth');
  }

  login(): void {
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    const credentials = {
      email: this.email,
      password: this.password
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.currentUserService.refresh().subscribe(() => {
          this.isSubmitting = false;
          this.router.navigateByUrl(this.authService.getDefaultRoute());
        });
      },
      error: () => {
        this.errorMessage = 'Email ou mot de passe incorrect.';
        this.isSubmitting = false;
      }
    });
  }

  openForgotPassword(): void {
    this.showForgotPassword = true;
    this.forgotEmail = this.email;
    this.verificationCode = '';
    this.newPassword = '';
    this.forgotMessage = '';
    this.forgotError = '';
    this.forgotStep = 'request';
  }

  closeForgotPassword(): void {
    this.showForgotPassword = false;
    this.forgotMessage = '';
    this.forgotError = '';
    this.isRequestingReset = false;
    this.isVerifyingCode = false;
    this.isResettingPassword = false;
  }

  requestReset(): void {
    if (!this.forgotEmail.trim() || this.isRequestingReset) {
      return;
    }

    this.isRequestingReset = true;
    this.forgotMessage = '';
    this.forgotError = '';

    this.authService.requestPasswordReset({ email: this.forgotEmail.trim() }).subscribe({
      next: (response) => {
        this.forgotStep = 'verify';
        this.forgotMessage = response?.message || 'Code envoye. Verifie ta boite email.';
        this.isRequestingReset = false;
      },
      error: (error) => {
        this.forgotError = error?.error?.message || 'Impossible d\'envoyer le code.';
        this.isRequestingReset = false;
      }
    });
  }

  verifyCode(): void {
    if (!this.forgotEmail.trim() || !this.verificationCode.trim() || this.isVerifyingCode) {
      return;
    }

    this.isVerifyingCode = true;
    this.forgotMessage = '';
    this.forgotError = '';

    this.authService.verifyResetCode({
      email: this.forgotEmail.trim(),
      code: this.verificationCode.trim()
    }).subscribe({
      next: (response) => {
        this.forgotStep = 'reset';
        this.forgotMessage = response?.message || 'Code valide. Tu peux definir un nouveau mot de passe.';
        this.isVerifyingCode = false;
      },
      error: (error) => {
        this.forgotError = error?.error?.message || 'Code invalide ou expire.';
        this.isVerifyingCode = false;
      }
    });
  }

  submitReset(): void {
    if (!this.forgotEmail.trim() || !this.verificationCode.trim() || this.newPassword.trim().length < 8 || this.isResettingPassword) {
      return;
    }

    this.isResettingPassword = true;
    this.forgotMessage = '';
    this.forgotError = '';

    this.authService.resetPassword({
      email: this.forgotEmail.trim(),
      code: this.verificationCode.trim(),
      newPassword: this.newPassword.trim()
    }).subscribe({
      next: (response) => {
        this.forgotMessage = response?.message || 'Mot de passe reinitialise avec succes.';
        this.forgotError = '';
        this.password = '';
        this.isResettingPassword = false;
      },
      error: (error) => {
        this.forgotError = error?.error?.message || 'Impossible de reinitialiser le mot de passe.';
        this.isResettingPassword = false;
      }
    });
  }
}
