import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'check-email',
    loadComponent: () => import('./email-check/email-check').then((m) => m.EmailCheck),
  },
  {
    path: 'signup',
    loadComponent: () => import('./register/register').then((m) => m.Register),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forget-password/forgot-password').then((m) => m.ForgotPassword),
  },
  { path: '', redirectTo: 'check-email', pathMatch: 'full' },
];
