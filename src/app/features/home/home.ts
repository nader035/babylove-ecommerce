import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import AOS from 'aos';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MOCK_PRODUCTS } from '../../core/constants/mock-data';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslocoModule],
  templateUrl: './home.html',
})
export class Home implements OnInit {
  private translocoService = inject(TranslocoService);
  products = MOCK_PRODUCTS;
  ngOnInit() {
    // ننتظر تحميل الترجمة قبل تشغيل AOS لضمان دقة الأبعاد
    this.translocoService.selectTranslation().subscribe(() => {
      setTimeout(() => {
        AOS.init({
          duration: 1200,
          once: true,
          mirror: false,
          easing: 'ease-in-out-cubic',
        });
      }, 100);
    });
  }
}
