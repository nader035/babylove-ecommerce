import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslocoModule } from '@jsverse/transloco';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { email, form, minLength, required, FormRoot, FormField } from '@angular/forms/signals';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../auth.store';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    FontAwesomeModule,
    TranslocoModule,
    MatFormField,
    MatLabel,
    MatInput,
    FormRoot,
    FormField,
    RouterLink,
    MatError,TranslocoModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css', // لو عندك ملف CSS خاص باللوجين
})
export class Login {
  authStore = inject(AuthStore);

  icons = {
    google: faGoogle,
    apple: faApple,
  };

  // تعريف بيانات اللوجين المبدئية، وبنسحب الإيميل من الـ Store
  loginFormData = signal({
    email: this.authStore.tempEmail() || '',
    password: '',
  });

  // تعريف الفورم باستخدام @angular/forms/signals
  loginForm = form(
    this.loginFormData,
    (path) => {
      // قواعد الـ Validation
      email(path.email);
      required(path.email);
      required(path.password);
      minLength(path.password, 6);
    },
    {
      submission: {
        action: async () => {
          // لما الفورم تعمل Submit (والبيانات تكون Valid)، ننده على الـ Store
          this.authStore.login(this.loginFormData());
        },
      },
    },
  );
}
