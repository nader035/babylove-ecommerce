import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginParams, SignUpParams, User } from '../models/iuser';
import { catchError, delay, map, Observable, of } from 'rxjs';

type ApiAuthEnvelope = {
  user: User;
  accessToken: string;
  refreshToken?: string;
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private authApi = environment.authApi;
  private usersApi = environment.usersApi;

  register(userData: SignUpParams): Observable<AuthResponse> {
    const newUser = {
      ...userData,
      image: 'https://robohash.org/' + userData.username,
    };

    if (environment.useMockApi) {
      return this.http.post<User>(this.usersApi, newUser).pipe(
        delay(1000),
        map((user) => this.toAuthResponse({ user, accessToken: this.mockToken() })),
      );
    }

    return this.http.post<ApiAuthEnvelope | AuthResponse>(`${this.authApi}/register`, newUser).pipe(
      map((response) => this.toAuthResponse(response)),
      catchError(() =>
        this.http
          .post<User>(this.usersApi, newUser)
          .pipe(map((user) => this.toAuthResponse({ user, accessToken: this.mockToken() }))),
      ),
    );
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.usersApi}?email=${encodeURIComponent(email)}`).pipe(
      delay(1000),
      map((users) => users.length > 0),
    );
  }

  login(credentials: LoginParams): Observable<AuthResponse> {
    if (environment.useMockApi) {
      return this.loginWithMockQuery(credentials);
    }

    return this.http
      .post<ApiAuthEnvelope | AuthResponse>(`${this.authApi}/login`, credentials)
      .pipe(
        map((response) => this.toAuthResponse(response)),
        catchError(() => this.loginWithMockQuery(credentials)),
      );
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.usersApi}/${id}`, data).pipe(delay(500));
  }

  private loginWithMockQuery(credentials: LoginParams): Observable<AuthResponse> {
    return this.http
      .get<
        User[]
      >(`${this.usersApi}?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`)
      .pipe(
        map((users) => {
          const user = users[0];
          if (!user) {
            throw new Error('Invalid email or password');
          }
          return this.toAuthResponse({ user, accessToken: this.mockToken() });
        }),
      );
  }

  private toAuthResponse(payload: ApiAuthEnvelope | AuthResponse): AuthResponse {
    if ('user' in payload) {
      return {
        ...payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken ?? '',
      };
    }

    return payload;
  }

  private mockToken(): string {
    return `mock-jwt-${crypto.randomUUID()}`;
  }
}
