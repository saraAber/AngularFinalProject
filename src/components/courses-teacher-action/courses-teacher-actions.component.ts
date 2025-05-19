import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Course } from '../../models/course.model';
import { CoursesService } from '../../app/courses.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-courses-teacher-actions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses-teacher-actions.component.html',
  styleUrls: ['./courses-teacher-actions.component.css']
})
export class CoursesTeacherActionsComponent implements OnInit {
  courses: Course[] = []; // רשימת הקורסים תטען כאן
  @Output() loadingChange = new EventEmitter<boolean>();
  @Output() errorOccurred = new EventEmitter<string>();

  newCourse: Course = { id: 0, title: '', description: '', teacherId: 0 };
  editingCourse: Course | null = null;

  constructor(private coursesService: CoursesService) { }

  ngOnInit(): void {
    this.loadCourses(); // טעינת הקורסים באתחול
  }

  loadCourses(): void {
    this.loadingChange.emit(true);
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loadingChange.emit(false);
      },
      error: (error) => {
        this.errorOccurred.emit('אירעה שגיאה בטעינת הקורסים.');
        console.error(error);
        this.loadingChange.emit(false);
      }
    });
  }

  addCourse(): void {
    this.loadingChange.emit(true);
    this.coursesService.addCourse(this.newCourse).subscribe({
      next: (course) => {
        this.courses.push(course);
        this.newCourse = { id: 0, title: '', description: '', teacherId: 0 };
        this.loadingChange.emit(false);
        this.loadCourses(); // רענן את רשימת הקורסים
      },
      error: (error) => {
        this.errorOccurred.emit('אירעה שגיאה בהוספת הקורס.');
        console.error(error);
        this.loadingChange.emit(false);
      }
    });
  }

  editCourse(course: Course): void {
    this.editingCourse = { ...course };
  }

  cancelEdit(): void {
    this.editingCourse = null;
  }

  saveCourse(): void {
    if (!this.editingCourse) return;
    this.loadingChange.emit(true);
    this.coursesService.updateCourse(this.editingCourse.id!, this.editingCourse).subscribe({
      next: (updatedCourse) => {
        const index = this.courses.findIndex(c => c.id === updatedCourse.id);
        if (index !== -1) {
          this.courses[index] = updatedCourse;
        }
        this.editingCourse = null;
        this.loadingChange.emit(false);
        this.loadCourses(); // רענן את רשימת הקורסים
      },
      error: (error) => {
        this.errorOccurred.emit('אירעה שגיאה בעריכת הקורס.');
        console.error(error);
        this.loadingChange.emit(false);
      }
    });
  }

  deleteCourse(courseId: number): void {
    this.loadingChange.emit(true);
    this.coursesService.deleteCourse(courseId).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== courseId);
        this.loadingChange.emit(false);
        this.loadCourses(); // רענן את רשימת הקורסים
      },
      error: (error) => {
        this.errorOccurred.emit('אירעה שגיאה במחיקת הקורס.');
        console.error(error);
        this.loadingChange.emit(false);
      }
    });
  }

  trackByFn(index: number, course: Course): number {
    return course.id || index;
  }
}