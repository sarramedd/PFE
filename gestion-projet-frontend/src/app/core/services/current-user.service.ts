import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Role, User } from 'src/app/shared/models/user.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {
  private readonly apiUrl = '/api/users';
  private readonly userSubject = new BehaviorSubject<User | null>(null);

  readonly user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  get snapshot(): User | null {
    return this.userSubject.value;
  }

  refresh(): Observable<User | null> {
    const email = this.authService.getUserEmail();

    if (!email) {
      this.userSubject.next(null);
      return of(null);
    }

    return this.http.get<User>(`${this.apiUrl}/email/${encodeURIComponent(email)}`).pipe(
      map((user) => this.normalizeUser(user)),
      tap((user) => this.userSubject.next(user)),
      catchError(() => {
        this.userSubject.next(null);
        return of(null);
      })
    );
  }

  updateProfile(payload: { firstName: string; lastName: string; email: string; cin?: number | null; password?: string }, avatar?: File | null): Observable<User> {
    const currentUser = this.userSubject.value;

    if (!currentUser) {
      return throwError(() => new Error('No authenticated user loaded.'));
    }

    const formData = new FormData();
    formData.append('firstName', payload.firstName);
    formData.append('lastName', payload.lastName);
    formData.append('email', payload.email);
    formData.append('cin', payload.cin != null ? String(payload.cin) : '');
    formData.append('password', payload.password ?? '');
    formData.append('role', currentUser.role);

    if (avatar) {
      formData.append('avatar', avatar);
    }

    return this.http.put<User>(`${this.apiUrl}/${currentUser.id}/profile`, formData).pipe(
      map((updatedUser) => this.normalizeUser({
        ...currentUser,
        ...updatedUser,
        password: undefined
      })),
      tap((user) => this.userSubject.next(user))
    );
  }

  clear(): void {
    this.userSubject.next(null);
  }

  private normalizeUser(user: Partial<User>): User {
    const rawUser = user as any;
    const organizationLogoUrl =
      rawUser?.organizationLogoUrl
      ?? rawUser?.organization_logo_url
      ?? rawUser?.organization?.logoUrl
      ?? rawUser?.organization?.logo_url
      ?? undefined;

    return {
      id: Number(user.id ?? 0),
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      role: (user.role as Role) ?? Role.MEMBER,
      cin: user.cin ? Number(user.cin) : undefined,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
      organizationId: user.organizationId ? Number(user.organizationId) : undefined,
      organizationName: user.organizationName,
      organizationLogoUrl
    };
  }
}
