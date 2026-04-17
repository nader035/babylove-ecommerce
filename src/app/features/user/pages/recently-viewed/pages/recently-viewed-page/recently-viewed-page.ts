import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faTrashAlt, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { ProductCardModel } from '../../../../../../core/services/product.service';
import { NotificationService } from '../../../../../../core/services/notification.service';
import { CartStore } from '../../../../../../core/stores/cart.store';
import { PreferencesStore } from '../../../../../../core/stores/preferences.store';
import {
  RecentlyViewedEntry,
  RecentlyViewedStore,
} from '../../../../../../core/stores/recently-viewed.store';

@Component({
  selector: 'app-recently-viewed-page',
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './recently-viewed-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentlyViewedPage {
  recentlyViewedStore = inject(RecentlyViewedStore);
  cartStore = inject(CartStore);
  private preferencesStore = inject(PreferencesStore);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);

  activeLang = this.preferencesStore.language;
  currencyCode = this.preferencesStore.currency;

  entries = computed(() => this.recentlyViewedStore.entries());

  icons = {
    recently: faClock,
    remove: faTrashAlt,
    bag: faShoppingBag,
  };

  addToCart(product: ProductCardModel): void {
    this.cartStore.addToCart(product);
    const title = product[this.activeLang()]?.title ?? '';
    this.notificationService.success(
      this.translocoService.translate('recentlyViewed.addedToBag', { title }),
    );
  }

  remove(entry: RecentlyViewedEntry): void {
    this.recentlyViewedStore.remove(entry.product.id);
    const title = entry.product[this.activeLang()]?.title ?? '';
    this.notificationService.info(
      this.translocoService.translate('recentlyViewed.removed', { title }),
    );
  }

  clearAll(): void {
    this.recentlyViewedStore.clear();
    this.notificationService.info(this.translocoService.translate('recentlyViewed.cleared'));
  }

  formatViewedAt(viewedAt: number): string {
    const languageTag = this.activeLang() === 'ar' ? 'ar-EG' : 'en-US';
    return new Intl.DateTimeFormat(languageTag, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(viewedAt));
  }
}
