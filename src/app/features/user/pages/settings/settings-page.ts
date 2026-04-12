import { ChangeDetectionStrategy, Component, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGlobe,
  faPalette,
  faBell,
  faShieldHalved,
  faChevronRight,
  faDollarSign,
} from '@fortawesome/free-solid-svg-icons';
import { PreferencesStore } from '../../../../core/stores/preferences.store';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule, FontAwesomeModule],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);
  preferencesStore = inject(PreferencesStore);

  currentLang = signal(this.preferencesStore.language());
  currentCurrency = signal(this.preferencesStore.currency());
  notificationsEnabled = signal(true);

  icons = {
    globe: faGlobe,
    palette: faPalette,
    bell: faBell,
    shield: faShieldHalved,
    chevron: faChevronRight,
    currency: faDollarSign,
  };

  setLanguage(lang: 'en' | 'ar') {
    this.transloco.setActiveLang(lang);
    this.currentLang.set(lang);
    this.preferencesStore.setLanguage(lang);
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }

  toggleNotifications() {
    this.notificationsEnabled.update((v) => !v);
  }

  setCurrency(currency: 'USD' | 'EGP') {
    this.currentCurrency.set(currency);
    this.preferencesStore.setCurrency(currency);
  }
}
