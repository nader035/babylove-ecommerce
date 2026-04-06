import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faCartPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { WishlistStore } from '../../../../core/stores/wishlist.store';
import { CartStore } from '../../../../core/stores/cart.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductCardModel } from '../../../../core/services/product.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';

@Component({
  selector: 'app-wishlist-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './wishlist-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WishlistPage {
  wishlistStore = inject(WishlistStore);
  cartStore = inject(CartStore);
  private notificationService = inject(NotificationService);
  private preferencesStore = inject(PreferencesStore);

  activeLang = this.preferencesStore.language;

  icons = {
    heart: faHeart,
    cartPlus: faCartPlus,
    trash: faTrashAlt,
  };

  moveToCart(product: ProductCardModel) {
    this.cartStore.addToCart(product);
    this.wishlistStore.remove(product.id);
    const title = product[this.activeLang()]?.['title'] || '';
    this.notificationService.success(`${title} moved to cart!`);
  }

  removeFromWishlist(product: ProductCardModel) {
    this.wishlistStore.remove(product.id);
    const title = product[this.activeLang()]?.['title'] || '';
    this.notificationService.info(`${title} removed from wishlist`);
  }
}
