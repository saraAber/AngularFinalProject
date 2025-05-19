import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Lesson } from '../models/lesson.model'; // Import the Lesson model
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root',
})
export class LessonService {
    private apiUrl = 'http://localhost:3000/api/courses';

    constructor(
        private http: HttpClient,
        private authService: AuthService,
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getAuthToken();
        if (!token) {
            console.error('אין טוקן התחברות.');
            return new HttpHeaders();
        }
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
        console.log('Fetching lessons for courseId:', courseId); // Debugging
        console.log('API URL:', `${this.apiUrl}/${courseId}/lessons`); // Debugging
        return this.http.get<Lesson[]>(`${this.apiUrl}/${courseId}/lessons`, { headers: this.getHeaders() });
    }

    createLesson(courseId: number, title: string, content: string): Observable<Lesson> {
        const lessonData = { title, content, courseId };
        console.log('Creating lesson:', lessonData); // Debugging
        return this.http.post<Lesson>(`${this.apiUrl}/${courseId}/lessons`, lessonData, { headers: this.getHeaders() });
    }

    deleteLesson(courseId: number, lessonId: number): Observable<void> {
        console.log(`Deleting lesson with ID ${lessonId} from course ${courseId}`); // Debugging
        return this.http.delete<void>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, { headers: this.getHeaders() });
    }

updateLesson(courseId: number, lessonId: number, title: string, content: string): Observable<Lesson> {
    const lessonData = { title, content, courseId };
    console.log(`Updating lesson with ID ${lessonId} in course ${courseId}:`, lessonData); // Debugging
    return this.http.put<Lesson>(`${this.apiUrl}/${courseId}/lessons/${lessonId}`, lessonData, { headers: this.getHeaders() });
}
}