import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginParams, SignUpParams, User } from '../models/iuser';
import { delay, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.authApi}`;

  register(userData: SignUpParams): Observable<User> {
    const newUser = {
      ...userData,
      id: Math.floor(Math.random() * 10000),
      image: 'https://robohash.org/' + userData.username,
    };
    return this.http.post<User>(this.apiUrl, newUser).pipe(delay(1000));
  }

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      delay(1000),
      map((users) => users.length > 0),
    );
  }
  login(credentials: LoginParams): Observable<User> {
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${credentials.email}&password=${credentials.password}`)
      .pipe(
        map((users) => {
          const user = users.find(
            (u) => u.email === credentials.email && u.password === credentials.password,
          );
          if (!user) {
            throw new Error('Invalid email or password');
          }
          return user;
        }),
      );
  }

  updateUser(id: number, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, data).pipe(delay(500));
  }
}
