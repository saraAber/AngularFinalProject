import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CoursesService } from '../../app/courses.service';
import { Course } from '../../models/course.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../app/auth.service';
import { User } from '../../models/user.model';
import { UserService } from '../../app/UserService';
import { FormsModule } from '@angular/forms'; // הוסף ייבוא זה
import {LessonService} from '../../app/lesson.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule],
})
export class HomeComponent implements OnInit {
  @ViewChild('userCircleElement') userCircleElementRef!: ElementRef;
  @ViewChild('userOptionsPopupElement') userOptionsPopupElementRef!: ElementRef;
  @ViewChild('searchIconElement') searchIconElementRef!: ElementRef;
  @ViewChild('searchPopupElement') searchPopupElementRef!: ElementRef;

  courses: Course[] = [];
  isTeacher: boolean = false;
  loading: boolean = true;
  error: string = '';
  selectedCourseId: number | null = null;
  selectedCourse: Course | null = null;
  userInfo: User | null = null;
  showUserOptions: boolean = false; // מצב התצוגה של פופאפ אפשרויות המשתמש
  showSearchPopup: boolean = false; // New property for search popup visibility

  constructor(
    private coursesService: CoursesService,
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private lessonService: LessonService,
  ) { }

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadCourses();
    this.updateUserRole();
  }

  updateUserRole(): void {
    const role = this.authService.getRoleFromToken();
    console.log('User role from token:', role);
    this.isTeacher = role === 'teacher';
  }

  loadUserInfo(): void {
    const userId = this.authService.getUserIdFromToken();
    console.log('User ID from token:', userId);
    if (userId) {
      this.userService.getUserById(userId).subscribe({
        next: (user) => this.userInfo = user,
        error: (err) => console.error('שגיאה בטעינת פרטי המשתמש', err)
      });
    }
  }

  getUserInitials(): string {
    if (this.userInfo && this.userInfo.name) {
      const names = this.userInfo.name.split(' ');
      let initials = '';
      for (const name of names) {
        if (name.length > 0) {
          initials += name[0].toUpperCase();
        }
      }
      return initials;
    }
    return '';
  }

  toggleUserOptions(): void {
    this.showUserOptions = !this.showUserOptions;
  }

  toggleSearchPopup(): void {
    this.showSearchPopup = !this.showSearchPopup;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/registration']);
  }

  goToEditCourses() {
    this.router.navigate(['/edit-courses']);
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
      },
    });
  }


  editUser(): void {
    if (!this.userInfo) return;

    const newName = prompt('הכנס שם חדש:', this.userInfo.name) || this.userInfo.name;
    const newEmail = prompt('הכנס מייל חדש:', this.userInfo.email) || this.userInfo.email;
    const newPasswordInput = prompt('הכנס סיסמה חדשה (השאר ריק אם אינך רוצה לשנות):'); // Will be null if Cancel is pressed, or string (possibly empty)
    const newRole = prompt('הכנס תפקיד חדש (admin / teacher / student):', this.userInfo.role) || this.userInfo.role;

    const updatedUser: any = {
      name: newName,
      email: newEmail,
      // Ensure password field is always sent.
      // If user cancels prompt (null) or enters nothing (empty string), send "". Otherwise, send the input.
      password: newPasswordInput === null ? "" : newPasswordInput,
      role: newRole
    };

    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      console.error('אין מזהה משתמש');
      return;
    }

    this.userService.updateUser(userId, updatedUser).subscribe({
      next: () => {
        alert('המשתמש עודכן בהצלחה');
        this.loadUserInfo(); // טען שוב את המידע המעודכן
      },
      error: err => console.error('שגיאה בעדכון המשתמש', err)
    });
  }

  deleteUser(): void {
    if (!this.userInfo) return;

    if (confirm('האם אתה בטוח שברצונך למחוק את המשתמש?')) {
      const userId = this.authService.getUserIdFromToken();
      if (!userId) {
        console.error('אין מזהה משתמש');
        return;
      }

      this.userService.deleteUser(userId).subscribe({
        next: () => {
          alert('המשתמש נמחק');
          this.authService.logout(); // ניקוי טוקן
          this.router.navigate(['/login']);
        },
        error: err => console.error('שגיאה במחיקת המשתמש', err)
      });
    }
  }

  enrollInCourse(courseId: number): void {
    this.coursesService.enrollUserInCourse(courseId).subscribe({
      next: () => {
        alert('נרשמת בהצלחה לקורס!');
        const course = this.courses.find((c) => c.id === courseId);
        if (course) {
          course.enrolled = true; // Mark the course as enrolled
        }
      },
      error: (error) => {
        console.error('שגיאה בהרשמה לקורס:', error);
        alert(`אירעה שגיאה בהרשמה לקורס: ${error.error?.message || 'שגיאה לא ידועה'}`);
      },
    });
  }

  goToLessonList(courseId: number): void {
  console.log('Navigating to lessons for course ID:', courseId);
  this.router.navigate(['/lessons', courseId]); // Navigate to the LessonListComponent with courseId
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
  trackByFn(index: number, course: Course): number {
    return course.id || index;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Close user options popup
    if (this.showUserOptions) {
      const userCircleClicked = this.userCircleElementRef?.nativeElement.contains(event.target);
      const userOptionsPopupClicked = this.userOptionsPopupElementRef?.nativeElement.contains(event.target);
      if (!userCircleClicked && !userOptionsPopupClicked) {
        this.showUserOptions = false;
      }
    }

    // Close search popup
    if (this.showSearchPopup) {
      const searchIconClicked = this.searchIconElementRef?.nativeElement.contains(event.target);
      const searchPopupClicked = this.searchPopupElementRef?.nativeElement.contains(event.target);
      if (!searchIconClicked && !searchPopupClicked) {
        this.showSearchPopup = false;
      }
    }
  }
}