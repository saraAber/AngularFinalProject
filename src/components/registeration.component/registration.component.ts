import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../app/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor} from '@angular/common';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
  imports: [ReactiveFormsModule, NgIf,NgFor],
  standalone: true,
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  errorMessage: string = '';
  roles = ['teacher', 'pupil'];

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registrationForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['',Validators.required]
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']); // נתיב לדף ההתחברות
  }

  onSubmit(): void {
    if (this.registrationForm.valid) {
      const registrationData = this.registrationForm.value; // קבל את כל נתוני הטופס
      this.authService.register(registrationData).subscribe({ // שלח את האובייקט המלא
        next: (response) => {
          console.log('הרשמה מוצלחת!', response);
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('שגיאה בהרשמה', error);
          this.errorMessage = 'שגיאה בהרשמה.';
        },
      });
    }
  }
}