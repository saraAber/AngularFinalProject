// user.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class UserService {
    private apiUrl = 'http://localhost:3000/api/users';

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getAuthToken(); // השתמש ב-AuthService כדי לקבל את הטוקן
        if (!token) {
            console.error('אין טוקן התחברות.');
            return new HttpHeaders();
        }
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });
    }

    getUserById(userId: string): Observable<User> {
        return this.http.get<User>(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() });
    }

    updateUser(userId: string, updates: Partial<User>): Observable<any> {
        return this.http.put(`${this.apiUrl}/${userId}`, updates, { headers: this.getHeaders() });
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${userId}`, { headers: this.getHeaders() });
    }


}
