import { Component, computed, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInstagram,
  faFacebook,
  faTiktok,
  faApplePay,
  faCcVisa,
  faCcMastercard,
} from '@fortawesome/free-brands-svg-icons';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
@Component({
  selector: 'app-footer',
  imports: [FontAwesomeModule, TranslocoModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private transloco = inject(TranslocoService);
  currentLang = signal(this.transloco.getActiveLang());
  langLabel = computed(() => (this.currentLang() === 'en' ? 'العربية' : 'English'));
  icons = {
    instagram: faInstagram,
    facebook: faFacebook,
    tiktok: faTiktok,
    visa: faCcVisa,
    mastercard: faCcMastercard,
    applePay: faApplePay,
  };
}
