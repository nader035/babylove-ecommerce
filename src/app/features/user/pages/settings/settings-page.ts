import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
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
import { AuthStore } from '../../../auth/auth.store';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoModule, FontAwesomeModule],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  preferencesStore = inject(PreferencesStore);
  authStore = inject(AuthStore);

  currentLang = this.preferencesStore.language;
  currentCurrency = this.preferencesStore.currency;
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
    if (this.currentLang() === lang) {
      return;
    }

    this.preferencesStore.setLanguage(lang);
    if (this.authStore.isAuthenticated()) {
      this.authStore.syncPreferencesFromStore();
    }
  }

  toggleNotifications() {
    this.notificationsEnabled.update((v) => !v);
  }

  setCurrency(currency: 'USD' | 'EGP') {
    if (this.currentCurrency() === currency) {
      return;
    }

    this.preferencesStore.setCurrency(currency);
    if (this.authStore.isAuthenticated()) {
      this.authStore.syncPreferencesFromStore();
    }
  }
}
