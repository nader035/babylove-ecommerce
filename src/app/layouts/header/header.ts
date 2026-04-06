import { Component, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faTimes,
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
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { PreferencesStore } from '../../core/stores/preferences.store';
import { ProductService, ProductCardModel } from '../../core/services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule, FontAwesomeModule],
  templateUrl: './header.html',
})
export class Header {
  private transloco = inject(TranslocoService);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private productService = inject(ProductService);

  auth = inject(AuthStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);
  preferencesStore = inject(PreferencesStore);

  currentLang = signal(this.preferencesStore.language());
  isMobileMenuOpen = signal(false);
  isSearchOpen = signal(false);
  searchQuery = signal('');
  searchResults = signal<ProductCardModel[]>([]);
  isProfileMenuOpen = false;

  navItems = ['home', 'shop', 'categories', 'blog', 'about us'];
  icons = {
    logo: faInfinity,
    menu: faBars,
    close: faTimes,
    search: faSearch,
    wishlist: faHeart,
    cart: faShoppingBag,
    user: faUserCircle,
    chevronDown: faChevronDown,
    box: faBox,
    settings: faCog,
    logout: faSignOutAlt,
  };

  langLabel = computed(() => (this.currentLang() === 'en' ? 'العربية' : 'English'));

  toggleLanguage() {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.transloco.setActiveLang(newLang);
    this.currentLang.set(newLang);
    this.preferencesStore.setLanguage(newLang as 'en' | 'ar');

    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update((state) => !state);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  toggleSearch() {
    this.isSearchOpen.update((state) => !state);
    if (!this.isSearchOpen()) {
      this.searchQuery.set('');
      this.searchResults.set([]);
    }
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    if (value.trim().length >= 2) {
      this.productService.getProducts().subscribe((products) => {
        const q = value.toLowerCase();
        this.searchResults.set(
          products.filter(
            (p) =>
              p.en.title.toLowerCase().includes(q) ||
              p.ar.title.toLowerCase().includes(q) ||
              p.categoryTitle?.toLowerCase().includes(q)
          ).slice(0, 5)
        );
      });
    } else {
      this.searchResults.set([]);
    }
  }

  goToProduct(slug: string) {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.router.navigate(['/product', slug]);
  }

  searchAll() {
    const q = this.searchQuery();
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.router.navigate(['/shop'], { queryParams: { search: q } });
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.auth.logOut();
  }
}
