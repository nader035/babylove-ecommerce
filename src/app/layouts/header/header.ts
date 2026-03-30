import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faShoppingBag,
  faSearch,
  faHeart,
  faUserCircle,
  faInfinity,
  faBox,
  faChevronDown,
  faCog,
  faSignOutAlt,
} from '@fortawesome/free-solid-svg-icons';
import { AuthStore } from '../../features/auth/auth.store';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule, FontAwesomeModule],
  templateUrl: './header.html',
})
export class Header {
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);
  auth = inject(AuthStore);
  currentLang = signal(this.transloco.getActiveLang());
  isProfileMenuOpen = false;
  icons = {
    logo: faInfinity,
    search: faSearch,
    wishlist: faHeart,
    cart: faShoppingBag,
    user: faUserCircle,
    chevronDown: faChevronDown,
    box: faBox,
    settings: faCog,
    logout: faSignOutAlt,
  };
  // اللوجيك بتاعك اللي بيقلب النص بناءً على اللغة الحالية
  langLabel = computed(() => (this.currentLang() === 'en' ? 'العربية' : 'English'));

  toggleLanguage() {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.transloco.setActiveLang(newLang);
    this.currentLang.set(newLang);

    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.auth.logOut();
  }
}
