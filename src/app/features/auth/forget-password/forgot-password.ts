import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslocoModule } from '@jsverse/transloco';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon'; // عشان نستخدم الأيقونات في الحقل وزرار الـ Success
import { RouterModule } from '@angular/router'; // عشان الـ Back Button

import { AuthStore } from '../auth.store';
import { faGoogle, faApple } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'; // أيقونة الرجوع
import { email, form, required, FormRoot, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-forgot-password',
  imports: [
    FormsModule,
    FontAwesomeModule,
    TranslocoModule,
    MatFormField,
    MatLabel,
    MatInput,
    FormRoot,
    FormField,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css', // لو عندك ملف CSS خاص
})
export class ForgotPassword {
  authStore = inject(AuthStore);

  // متغير مؤقت عشان الـ UI يبان لما نبعت الإيميل (لحد ما الباك يخلص)
  isEmailSent = false;

  icons = {
    google: faGoogle,
    apple: faApple,
    back: faArrowLeft, // ضفنا أيقونة الرجوع
  };

  // تعريف بيانات الفورم المبدئية، وبنسحب الإيميل من الـ Store لو موجود
  forgotPasswordData = signal({
    email: this.authStore.tempEmail() || '',
  });

  // تعريف الفورم باستخدام @angular/forms/signals
  forgotPasswordForm = form(
    this.forgotPasswordData,
    (path) => {
      // قواعد الـ Validation
      email(path.email);
      required(path.email);
    },
    {
      submission: {
        action: async () => {
          // لما الفورم تعمل Submit، بننده على الـ Store (لما الباك يخلص)
          console.log('Requesting reset link for:', this.forgotPasswordData().email);

          // محاكاة سريعة للـ Loading والـ Success لحد ما نربط الباك
          // this.authStore.requestPasswordReset(this.forgotPasswordData().email);

          this.isEmailSent = true; // إظهار رسالة النجاح في الـ UI

          // ممكن هنا نوجهه لصفحة "Check Inbox" شيك أو نسيبه في نفس الصفحة ونظهر الرسالة
        },
      },
    },
  );
}
