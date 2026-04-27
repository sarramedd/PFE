import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleRedirectGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAccess(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.checkAccess(route, state);
  }

  private checkAccess(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }

    const area = route.data['area'] as 'admin' | 'frontoffice';
    const isAdmin = this.authService.isAdminUser();

    if (area === 'admin' && !isAdmin) {
      return this.router.createUrlTree(['/frontoffice/dashboard']);
    }

    if (area === 'frontoffice' && isAdmin) {
      return this.router.createUrlTree(['/admin/dashboard']);
    }

    return true;
  }
}
