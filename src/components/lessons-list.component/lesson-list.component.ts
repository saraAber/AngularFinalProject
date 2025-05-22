import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LessonService } from '../../app/lesson.service';
import { Lesson } from '../../models/lesson.model';
import { AuthService } from '../../app/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewEncapsulation } from '@angular/core';
import { CoursesService } from '../../app/courses.service'; // Import CoursesService
import { Course } from '../../models/course.model'; // Import Course model
import { MatIconModule } from '@angular/material/icon'; // Add this import

@Component({
    selector: 'app-lesson-list',
    templateUrl: './lesson-list.component.html',
    styleUrls: ['./lesson-list.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule, MatIconModule], // Add MatIconModule here
    encapsulation: ViewEncapsulation.None,
})
export class LessonListComponent implements OnInit {
    lessons: Lesson[] = [];
    loading: boolean = true;
    error: string = '';
    courseId: number | null = null;
    isTeacher: boolean = false;
    newLessonTitle: string = '';
    newLessonContent: string = '';
    courseDetails: Course | null = null; // Add property for course details
    isCreateLessonFormVisible: boolean = false; // To control form visibility

    constructor(
        private route: ActivatedRoute,
        private lessonService: LessonService,
        private authService: AuthService,
        private coursesService: CoursesService // Inject CoursesService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.courseId = +params['courseId'];
            this.loadCourseDetails(); // Fetch course details
            this.loadLessons();
        });

        // Check if the user is a teacher
        const role = this.authService.getRoleFromToken();
        this.isTeacher = role === 'teacher';
    }

    loadCourseDetails(): void {
        if (!this.courseId) {
            console.error('No course ID available for fetching course details.');
            return;
        }

        this.coursesService.getCourseById(this.courseId).subscribe({
            next: (course: Course) => {
                this.courseDetails = course; // Assign course details
            },
            error: (error) => {
                console.error('Error fetching course details:', error);
            },
        });
    }

    loadLessons(): void {
        if (!this.courseId) {
            this.error = 'No course selected.';
            this.loading = false;
            return;
        }

        this.lessonService.getLessonsByCourseId(this.courseId).subscribe({
            next: (lessons: Lesson[]) => {
                this.lessons = lessons;
                this.loading = false;
            },
            error: (error) => {
                this.error = 'Error loading lessons.';
                console.error(error);
                this.loading = false;
            },
        });
    }

    createLesson(): void {
        if (!this.courseId) {
            console.error('No course ID available for creating a lesson.');
            return;
        }

        this.lessonService.createLesson(this.courseId, this.newLessonTitle, this.newLessonContent).subscribe({
            next: () => {
                console.log('Lesson created successfully.');
                this.loadLessons(); // Reload the lessons from the server
                this.newLessonTitle = ''; // Clear the form
                this.newLessonContent = ''; // Clear the form
            },
            error: (error) => {
                console.error('Error creating lesson:', error);
            },
        });
    }

    deleteLesson(lessonId: number): void {
        if (!this.courseId) {
            console.error('No course ID available for deleting a lesson.');
            return;
        }

        if (!confirm('האם אתה בטוח שברצונך למחוק את השיעור?')) {
            return; // Exit if the user cancels the confirmation
        }

        this.lessonService.deleteLesson(this.courseId, lessonId).subscribe({
            next: () => {
                console.log(`Lesson with ID ${lessonId} deleted successfully.`);
                this.loadLessons();
            },
            error: (error) => {
                console.error('Error deleting lesson:', error);
            },
        });
    }

    editLesson(lesson: Lesson): void {
    if (!this.courseId) {
        console.error('No course ID available for editing a lesson.');
        return;
    }

    const updatedTitle = prompt('ערוך את כותרת השיעור:', lesson.title);
    const updatedContent = prompt('ערוך את תוכן השיעור:', lesson.content);

    if (updatedTitle === null || updatedContent === null) {
        return; // Exit if the user cancels the prompt
    }

    this.lessonService.updateLesson(this.courseId, lesson.id, updatedTitle, updatedContent).subscribe({
        next: (updatedLesson: Lesson) => {
            console.log(`Lesson with ID ${lesson.id} updated successfully.`);
            // Update the lesson in the local list
            const index = this.lessons.findIndex((l) => l.id === lesson.id);
            if (index !== -1) {
                this.lessons[index] = updatedLesson;
            }
            this.loadLessons();
        },
        error: (error) => {
            console.error('Error updating lesson:', error);
        },
    });
}

    toggleCreateLessonForm(): void {
        this.isCreateLessonFormVisible = !this.isCreateLessonFormVisible;
    }
}