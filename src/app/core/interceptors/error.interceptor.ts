import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { AuthSessionService } from '../services/auth-session.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const authSession = inject(AuthSessionService);

  return next(req).pipe(
    catchError((error) => {
      let message = 'An unexpected error occurred.';
      const httpError = error as HttpErrorResponse;

      if (httpError.status === 0) {
        message = 'Unable to connect to the server. Please check your connection.';
      } else if (httpError.status === 401) {
        message = 'Your session has expired. Please sign in again.';
        authSession.clear();
        router.navigate(['/auth']);
      } else if (httpError.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (httpError.status === 404) {
        message = 'The requested resource was not found.';
      } else if (httpError.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      notificationService.error(message);
      return throwError(() => error);
    }),
  );
};
