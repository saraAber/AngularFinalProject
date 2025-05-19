import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs'; // הוסף throwError
import { Course } from '../models/course.model';
import { AuthService } from './auth.service'; // ייבוא AuthService
import { map } from 'rxjs/operators'; // הוסף ייבוא map
@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  private apiUrl = 'http://localhost:3000/api/courses';

  constructor(private http: HttpClient, private authService: AuthService) { } // הוסף AuthService

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken(); // השתמש ב-AuthService כדי לקבל את הטוקן
    if (!token) {
      console.error('אין טוקן התחברות.');
      // אפשרות 1: זרוק שגיאה
      // return throwError('אין טוקן התחברות.');
      // אפשרות 2: החזר כותרות ריקות (תלוי בהעדפה שלך)
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

getCourses(): Observable<Course[]> {
  return this.http.get<Course[]>(this.apiUrl, { headers: this.getHeaders() }).pipe(
    map((courses) => {
      const userId = this.authService.getUserIdFromToken();
      return courses.map((course) => ({
        ...course,
        enrolled: this.checkEnrollment(course.id, userId), // Mock or backend logic
      }));
    })
  );
}

// Mock function to check enrollment (replace with backend logic if available)
private checkEnrollment(courseId: number, userId: string | null): boolean {
  // Replace this with actual logic to check enrollment
  return false; // Default to not enrolled
}

  addCourse(course: Course): Observable<Course> {
    console.log('תפקיד משתמש:', this.authService.getRoleFromToken());
    return this.http.post<Course>(this.apiUrl, course, { headers: this.getHeaders() });
  }

  getCourseById(id: number): Observable<Course> {
    return this.http.get<Course>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  updateCourse(id: number, course: Course): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course, { headers: this.getHeaders() });
  }

  deleteCourse(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  enrollUserInCourse(courseId: number): Observable<any> {
    const userId = this.authService.getUserIdFromToken(); // Extract userId from the token
    console.log('User ID:', userId); // Debugging

    if (!userId) {
      console.error('User ID is missing or invalid.');
      return throwError(() => new Error('User ID is missing or invalid.'));
    }

    return this.http.post(
      `${this.apiUrl}/${courseId}/enroll`,
      { userId }, // Include userId in the request body
      { headers: this.getHeaders() }
    );
  }
}