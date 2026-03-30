import { Component, inject, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../auth.store';
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslocoModule } from '@jsverse/transloco';
import {  MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-email-check',
  imports: [
    FormsModule,
    FontAwesomeModule,
    TranslocoModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
  ],
  templateUrl: './email-check.html',
  styleUrl: './email-check.css',
})
export class EmailCheck {
  email = signal('');
  authStore = inject(AuthStore);

  icons = {
    google: faGoogle,
    apple: faApple,
  };
  onContinue() {
    if (!this.isValidEmail()) {
      alert('Please enter a valid email address.');
      return;
    }
    this.authStore.checkEmail(this.email());
  }
  isValidEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email());
  }
}
