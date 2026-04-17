import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, map, of, switchMap } from 'rxjs';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBars,
  faTimes,
  faShoppingBag,
  faSearch,
  faHeart,
  faClock,
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
import { RecentlyViewedStore } from '../../core/stores/recently-viewed.store';
import { PreferencesStore } from '../../core/stores/preferences.store';
import { ProductService, ProductCardModel } from '../../core/services/product.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoModule, FontAwesomeModule],
  templateUrl: './header.html',
})
export class Header {
  private router = inject(Router);
  private productService = inject(ProductService);
  private destroyRef = inject(DestroyRef);
  private searchTerms$ = new Subject<string>();

  auth = inject(AuthStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);
  recentlyViewedStore = inject(RecentlyViewedStore);
  preferencesStore = inject(PreferencesStore);

  currentLang = this.preferencesStore.language;
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
    recent: faClock,
    wishlist: faHeart,
    cart: faShoppingBag,
    user: faUserCircle,
    chevronDown: faChevronDown,
    box: faBox,
    settings: faCog,
    logout: faSignOutAlt,
  };

  langLabel = computed(() => (this.currentLang() === 'en' ? 'العربية' : 'English'));

  constructor() {
    this.searchTerms$
      .pipe(
        map((value) => value.trim()),
        debounceTime(220),
        distinctUntilChanged(),
        switchMap((query) =>
          query.length >= 2 ? this.productService.searchProducts(query, 5) : of([]),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.searchResults.set(results));
  }

  toggleLanguage() {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.preferencesStore.setLanguage(newLang as 'en' | 'ar');
    if (this.auth.isAuthenticated()) {
      this.auth.syncPreferencesFromStore();
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
      this.searchTerms$.next('');
    }
  }

  onSearchInput(value: string) {
    this.searchQuery.set(value);
    this.searchTerms$.next(value);
  }

  goToProduct(slug: string) {
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.router.navigate(['/product', slug]);
  }

  searchAll() {
    const q = this.searchQuery().trim();
    this.isSearchOpen.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.router.navigate(['/shop'], { queryParams: { q: q || null } });
  }

  logout() {
    this.isProfileMenuOpen = false;
    this.auth.logOut();
  }
}
