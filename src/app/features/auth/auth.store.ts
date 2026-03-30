import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators'; // 👈 الـ Hero بتاعنا
import { pipe, switchMap, tap } from 'rxjs';
import { User, SignUpParams, LoginParams } from '../../core/models/iuser';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

export type AuthState = {
  user: User | null;
  tempEmail: string | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    // استرجاع البيانات المبدئية من الـ Storage
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
    tempEmail: null,
  }),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!user() && !!token()),
    userFullName: computed(() => (user() ? `${user()?.firstName} ${user()?.lastName}` : null)),
  })),
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => ({
    // 1. عملية التسجيل (SignUp)
    signUp: rxMethod<SignUpParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((params) =>
          authService.register(params).pipe(
            tapResponse({
              next: (newUser) => {
                const mockToken = 'premium-jwt-' + crypto.randomUUID();
                patchState(store, { user: newUser, token: mockToken, isLoading: false });
                localStorage.setItem('user', JSON.stringify(newUser));
                localStorage.setItem('token', mockToken);
                router.navigate(['/']);
              },
              error: (error: any) => {
                patchState(store, {
                  error: 'Registration failed. Email might be taken.',
                  isLoading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

    // 2. عملية تسجيل الدخول (Login)
    login: rxMethod<LoginParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((params) =>
          authService.login(params).pipe(
            tapResponse({
              next: (user) => {
                const mockToken = 'premium-jwt-' + crypto.randomUUID();
                patchState(store, { user: user, token: mockToken, isLoading: false });
                localStorage.setItem('user', JSON.stringify(user));
                localStorage.setItem('token', mockToken);
                router.navigate(['/']);
              },
              error: (error: any) => {
                patchState(store, {
                  error: 'Invalid email or password. Please try again.',
                  isLoading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

    // 3. التحقق من وجود البريد (Check Email)
    checkEmail: rxMethod<string>(
      pipe(
        tap((email) => patchState(store, { isLoading: true, error: null, tempEmail: email })),
        switchMap((email) =>
          authService.checkEmailExists(email).pipe(
            tapResponse({
              next: (exists) => {
                patchState(store, { isLoading: false });
                const target = exists ? '/auth/login' : '/auth/signup';
                router.navigate([target], { queryParams: { email } });
              },
              error: (error: any) => {
                patchState(store, {
                  error: 'Something went wrong. Please try again.',
                  isLoading: false,
                });
              },
            }),
          ),
        ),
      ),
    ),

    // 4. تسجيل الخروج (LogOut)
    logOut() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      patchState(store, { user: null, token: null, tempEmail: null });
      router.navigate(['/auth']);
    },
  })),
);
