import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Role } from 'src/app/shared/models/user.model';

export interface AuthResponse {
  token: string;
  role: Role | string;
  userId: number;
  organizationId: number;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message?: string;
}

interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'token';
  private readonly roleKey = 'role';
  private readonly userIdKey = 'userId';
  private readonly organizationIdKey = 'organizationId';
  private readonly apiUrl = 'http://localhost:8088/api/auth';

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.roleKey, String(response.role));
          localStorage.setItem(this.userIdKey, String(response.userId));
          localStorage.setItem(this.organizationIdKey, String(response.organizationId));
        })
      );
  }

  register(user: any) {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  requestPasswordReset(payload: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.apiUrl}/forgot-password`, payload);
  }

  verifyResetCode(payload: VerifyResetCodeRequest): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${this.apiUrl}/verify-reset-code`, payload);
  }

  resetPassword(payload: ResetPasswordRequest): Observable<{ message?: string }> {
    return this.http.post<{ message?: string }>(`${this.apiUrl}/reset-password`, payload);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUserEmail(): string | null {
    const payload = this.getTokenPayload();
    return typeof payload?.['sub'] === 'string' ? payload['sub'] : null;
  }

  getRole(): Role | null {
    return localStorage.getItem(this.roleKey) as Role | null;
  }

  getUserId(): number | null {
    const value = localStorage.getItem(this.userIdKey);
    return value ? Number(value) : null;
  }

  getOrganizationId(): number | null {
    const value = localStorage.getItem(this.organizationIdKey);
    return value ? Number(value) : null;
  }

  isSuperAdmin(): boolean {
    return this.getRole() === Role.SUPER_ADMIN;
  }

  isAdminRole(role: Role | string | null): boolean {
    return role === Role.SUPER_ADMIN || role === Role.ADMIN || role === Role.ORGANIZATION_ADMIN;
  }

  isAdminUser(): boolean {
    return this.isAdminRole(this.getRole());
  }

  getDefaultRoute(): string {
    return this.isAdminUser() ? '/admin/dashboard' : '/frontoffice/dashboard';
  }

  buildWebSocketUrl(path: string): string {
    const token = this.getToken();
    const base = this.apiUrl.replace(/^http/i, 'ws').replace(/\/api\/auth$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const separator = normalizedPath.includes('?') ? '&' : '?';
    return `${base}${normalizedPath}${token ? `${separator}token=${encodeURIComponent(token)}` : ''}`;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem(this.userIdKey);
    localStorage.removeItem(this.organizationIdKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private getTokenPayload(): Record<string, unknown> | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const parts = token.split('.');

    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
      return JSON.parse(atob(padded)) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
