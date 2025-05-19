import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs';
import { User } from '../models/user.model';
import { AuthResponse } from '../models/auth-response.model';
import { JwtHelperService } from '@auth0/angular-jwt';

interface RegistrationData {
  name?: string;
  email: string;
  password: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private authToken: string | null = null;
  public helper = new JwtHelperService();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<AuthResponse> {
    const loginData = { email, password };
    return this.http.post(`${this.apiUrl}/login`, loginData).pipe(
      tap(response => {
        if (response && response.token) {
          this.authToken = response.token;
          localStorage.setItem('authToken', response.token);
          console.log('הטוקן נשמר לאחר התחברות:', response.token);
        }
      })
    );
  }

  register(registrationData: RegistrationData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registrationData).pipe(
      tap(response => {
        if (response && response.token) {
          this.authToken = response.token;
          localStorage.setItem('authToken', response.token);
          console.log('הטוקן נשמר לאחר הרשמה:', response.token);
        }
      })
    );
  }

  getRoleFromToken(): string | null {
    const token = localStorage.getItem('authToken');
    if (token && !this.helper.isTokenExpired(token)) {
      try {
        const decodedToken = this.helper.decodeToken(token);
        console.log('פענוח הטוקן:', decodedToken.role);
        return decodedToken ? decodedToken.role : null;
      } catch (error) {
        console.error('שגיאה בפענוח הטוקן:', error);
        return null;
      }
    }
    return null;
  }

  getUserIdFromToken(): string | null {
    const token = this.getAuthToken();
    if (token && !this.helper.isTokenExpired(token)) {
      try {
        const decodedToken = this.helper.decodeToken(token);
        console.log('Decoded token:', decodedToken); // Debugging
        return decodedToken.userId; // Ensure the token contains a `userId` field
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    return null;
  }

  getUserInfoFromToken(): { name: string; role: string } | null {
    const token = localStorage.getItem('authToken');
    if (token && !this.helper.isTokenExpired(token)) {
      try {
        const decodedToken = this.helper.decodeToken(token);
        return {
          name: decodedToken.name,
          role: decodedToken.role

        };
      } catch (error) {
        console.error('שגיאה בפענוח הטוקן:', error);
        return null;
      }
    }
    return null;
  }

  // פונקציה חדשה לקבלת הטוקן
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAuthToken();
  }

  logout(): void {
    this.authToken = null;
    localStorage.removeItem('authToken');
    console.log('המשתמש התנתק, הטוקן נמחק.');
  }

}