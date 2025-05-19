import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from '../components/login.component/login.component';
import { RegistrationComponent } from '../components/registeration.component/registration.component';
import { NgModule } from '@angular/core';
import { CoursesListComponent } from '../components/courses-list/courses-list.component';
import { CoursesTeacherActionsComponent } from '../components/courses-teacher-action/courses-teacher-actions.component'; // ייבוא הקומפוננטה החדשה
import { HomeComponent } from '../components/home/home.component'; // ייבוא הקומפוננטה החדשה
import { LessonListComponent } from '../components/lessons-list.component/lesson-list.component';

export const routes: Routes = [
 {path: 'login', component: LoginComponent},
 {path: 'home', component: HomeComponent}, // נתיב לדף הבית
 { path: '', redirectTo: '/home', pathMatch: 'full' }, // נתיב ברירת מחדלת
 {path: 'registration', component: RegistrationComponent}, // נתיב להרשמה
 {path: 'courses', component: CoursesListComponent}, // נתיב לרשימת הקורסים
 { path: 'edit-courses', component: CoursesTeacherActionsComponent }, // נתיב לדף עריכת הקורסים;
   { path: 'lessons/:courseId', component: LessonListComponent }, // Route for LessonListComponent

]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })


  export class AppRoutingModule {}