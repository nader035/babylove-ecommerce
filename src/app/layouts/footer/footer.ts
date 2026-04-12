import { Component, computed, inject } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faInstagram,
  faFacebook,
  faTiktok,
  faApplePay,
  faCcVisa,
  faCcMastercard,
} from '@fortawesome/free-brands-svg-icons';
import { TranslocoModule } from '@jsverse/transloco';
import { PreferencesStore } from '../../core/stores/preferences.store';
@Component({
  selector: 'app-footer',
  imports: [FontAwesomeModule, TranslocoModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private preferencesStore = inject(PreferencesStore);
  currentLang = this.preferencesStore.language;
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
