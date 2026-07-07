import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  // Attach access token to every outgoing request
  const authReq = token
    ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If access token expired and we're not already calling the refresh endpoint
      if (error.status === 401 && !req.url.includes('/auth/refresh') && !req.url.includes('/auth/login')) {
        // Try to silently refresh
        return authService.refreshAccessToken().pipe(
          switchMap(response => {
            // Retry the original request with the new access token
            const retryReq = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${response.accessToken}`)
            });
            return next(retryReq);
          }),
          catchError(refreshError => {
            // Refresh token also expired → force logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
