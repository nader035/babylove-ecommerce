import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslocoModule } from '@jsverse/transloco';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { AuthStore } from '../auth.store';
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { email, form, minLength, required, FormRoot, FormField } from '@angular/forms/signals';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  imports: [
    FormsModule,
    FontAwesomeModule,
    TranslocoModule,
    MatFormField,
    MatLabel,
    MatInput,
    FormRoot,
    FormField,
    MatError,
    MatIconModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  authStore = inject(AuthStore);
  icons = {
    google: faGoogle,
    apple: faApple,
  };

  signFormData = signal({
    username: '',
    email: `${this.authStore.tempEmail()}`,
    password: '',
    firstName: '',
    lastName: '',
  });

  registerForm = form(
    this.signFormData,
    (path) => {
      required(path.username);
      email(path.email);
      required(path.email);
      required(path.firstName);
      required(path.lastName);
      minLength(path.password, 6);
    },
    {
      submission: {
        action: async () => {
          this.authStore.signUp(this.signFormData());
        },
      },
    },
  );
}
