import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error) => {
      let message = 'An unexpected error occurred.';

      if (error.status === 0) {
        message = 'Unable to connect to the server. Please check your connection.';
      } else if (error.status === 401) {
        message = 'Your session has expired. Please sign in again.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.navigate(['/auth']);
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      }

      notificationService.error(message);
      return throwError(() => error);
    }),
  );
};
