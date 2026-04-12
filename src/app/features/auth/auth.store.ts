import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';
import { User, SignUpParams, LoginParams, UserPreferences } from '../../core/models/iuser';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { AuthSessionService } from '../../core/services/auth-session.service';
import { PreferencesStore } from '../../core/stores/preferences.store';

export type AuthState = {
  user: User | null;
  tempEmail: string | null;
  token: string | null;
  isLoading: boolean;
  isSavingPreferences: boolean;
  error: string | null;
  preferencesError: string | null;
};

const readInitialUser = (): User | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  try {
    const raw = localStorage.getItem('user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const readInitialToken = (): string | null => {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem('token');
};

const mapResponseToUser = (response: {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  password?: string;
  phoneNumber?: string;
  addresses?: User['addresses'];
  isActive?: boolean;
  preferences?: UserPreferences;
}): User => ({
  id: response.id,
  username: response.username,
  email: response.email,
  firstName: response.firstName,
  lastName: response.lastName,
  gender: response.gender,
  image: response.image,
  password: response.password,
  phoneNumber: response.phoneNumber,
  addresses: response.addresses,
  isActive: response.isActive,
  preferences: response.preferences,
});

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: readInitialUser(),
    token: readInitialToken(),
    isLoading: false,
    isSavingPreferences: false,
    error: null,
    preferencesError: null,
    tempEmail: null,
  }),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!user() && !!token()),
    userFullName: computed(() => (user() ? `${user()?.firstName} ${user()?.lastName}` : null)),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      router = inject(Router),
      authSession = inject(AuthSessionService),
      preferencesStore = inject(PreferencesStore),
    ) => ({
      signUp: rxMethod<SignUpParams>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((params) =>
            authService.register(params).pipe(
              tapResponse({
                next: (response) => {
                  const user = mapResponseToUser(response);

                  patchState(store, { user, token: response.accessToken, isLoading: false });
                  authSession.setSession(user, response.accessToken);
                  preferencesStore.hydrateFromUser(user.preferences);
                  router.navigate(['/']);
                },
                error: () => {
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

      login: rxMethod<LoginParams>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((params) =>
            authService.login(params).pipe(
              tapResponse({
                next: (response) => {
                  const user = mapResponseToUser(response);

                  patchState(store, { user, token: response.accessToken, isLoading: false });
                  authSession.setSession(user, response.accessToken);
                  preferencesStore.hydrateFromUser(user.preferences);
                  router.navigate(['/']);
                },
                error: () => {
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
                error: () => {
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

      updateProfile: rxMethod<{ id: number; data: Partial<User> }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, data }) =>
            authService.updateUser(id, data).pipe(
              tapResponse({
                next: (updatedUser) => {
                  patchState(store, { user: updatedUser, isLoading: false });
                  const token = store.token();
                  if (token) {
                    authSession.setSession(updatedUser, token);
                  }
                  preferencesStore.hydrateFromUser(updatedUser.preferences);
                },
                error: () => {
                  patchState(store, {
                    error: 'Failed to update profile. Please try again.',
                    isLoading: false,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      savePreferences: rxMethod<UserPreferences>(
        pipe(
          tap(() => patchState(store, { isSavingPreferences: true, preferencesError: null })),
          switchMap((partial) => {
            const user = store.user();
            if (!user) {
              patchState(store, { isSavingPreferences: false });
              return EMPTY;
            }

            return authService.updatePreferences(user.id, partial).pipe(
              tapResponse({
                next: (updatedUser) => {
                  patchState(store, {
                    user: updatedUser,
                    isSavingPreferences: false,
                    preferencesError: null,
                  });
                  const token = store.token();
                  if (token) {
                    authSession.setSession(updatedUser, token);
                  }
                  preferencesStore.hydrateFromUser(updatedUser.preferences);
                },
                error: () => {
                  patchState(store, {
                    isSavingPreferences: false,
                    preferencesError: 'Failed to save preferences. Please try again.',
                  });
                },
              }),
            );
          }),
        ),
      ),

      syncPreferencesFromStore: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isSavingPreferences: true, preferencesError: null })),
          switchMap(() => {
            const user = store.user();
            if (!user) {
              patchState(store, { isSavingPreferences: false });
              return EMPTY;
            }

            return authService
              .updatePreferences(user.id, {
                language: preferencesStore.language(),
                currency: preferencesStore.currency(),
              })
              .pipe(
                tapResponse({
                  next: (updatedUser) => {
                    patchState(store, {
                      user: updatedUser,
                      isSavingPreferences: false,
                      preferencesError: null,
                    });
                    const token = store.token();
                    if (token) {
                      authSession.setSession(updatedUser, token);
                    }
                    preferencesStore.hydrateFromUser(updatedUser.preferences);
                  },
                  error: () => {
                    patchState(store, {
                      isSavingPreferences: false,
                      preferencesError: 'Failed to save preferences. Please try again.',
                    });
                  },
                }),
              );
          }),
        ),
      ),

      logOut() {
        authSession.clear();
        patchState(store, { user: null, token: null, tempEmail: null });
        router.navigate(['/auth']);
      },
    }),
  ),
);
