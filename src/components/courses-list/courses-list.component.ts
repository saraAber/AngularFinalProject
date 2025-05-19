import { Component, OnInit } from '@angular/core';
import { Course } from '../../models/course.model';
import { CoursesService } from '../../app/courses.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../app/auth.service';
import { MatDialog } from '@angular/material/dialog';  

@Component({
  selector: 'app-courses-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './courses-list.component.html',
  styleUrls: ['./courses-list.component.css']
})
export class CoursesListComponent implements OnInit {
  courses: Course[] = [];
  loading: boolean = true;
  error: string = '';
  selectedCourseId: number | null = null;
  selectedCourse: Course | null = null;
  userRole: string | null = null;
    isLoggedIn = false;


  constructor(
    private coursesService: CoursesService,
    private authService: AuthService,
    public dialog: MatDialog 
  ) { }

  ngOnInit(): void {
    this.loadCourses();
    this.userRole = this.authService.getRoleFromToken();
  }


  loadCourses(): void {
    this.loading = true;
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'אירעה שגיאה בטעינת הקורסים.';
        console.error(error);
        this.loading = false;
      }
    });
  }

  loadCourseById(): void {
    if (this.selectedCourseId) {
      this.loading = true;
      this.coursesService.getCourseById(this.selectedCourseId).subscribe({
        next: (course) => {
          this.selectedCourse = course;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'אירעה שגיאה בטעינת הקורס.';
          console.error(error);
          this.loading = false;
          this.selectedCourse = null;
        }
      });
    }
  }

enrollInCourse(courseId: number): void {
  this.coursesService.enrollUserInCourse(courseId).subscribe({
    next: () => {
      alert('נרשמת בהצלחה לקורס!');
      const course = this.courses.find((c) => c.id === courseId);
      if (course) {
        course.enrolled = true; 
      }
    },
    error: (error) => {
      console.error('שגיאה בהרשמה לקורס:', error);
      alert(`אירעה שגיאה בהרשמה לקורס: ${error.error?.message || 'שגיאה לא ידועה'}`);
    },
  });
}


trackByFn(index: number, course: Course): number {
  return course.id || index;
}

}