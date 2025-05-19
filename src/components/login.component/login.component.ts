import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../app/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/registration']); // נתיב לדף ההרשמה
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email; // קבל את שם המשתמש מהטופס
      const password = this.loginForm.value.password; // קבל את הסיסמה מהטופס
      this.authService.login(email, password).subscribe({
        next: (response) => {
          // טיפול בתגובה מוצלחת מהשרת (למשל, שמירת טוקן, ניווט לדף אחר)
          console.log('התחברות מוצלחת!', response);
          this.router.navigate(['/home']); // דוגמה לניתוב לאחר התחברות
        },
        error: (error) => {
          // טיפול בשגיאה מהשרת (למשל, הצגת הודעת שגיאה למשתמש)
          console.error('שגיאה בהתחברות', error);
          this.errorMessage = 'מייל או סיסמה לא נכונים.';
        },
      });
    }
  }
}