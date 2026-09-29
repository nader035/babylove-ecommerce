import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBookmark,
  faEye,
  faHeart as faHeartSolid,
  faShoppingBag,
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { NotificationService } from '../../../core/services/notification.service';
import { ProductCardModel } from '../../../core/services/product.service';
import { PreferencesStore } from '../../../core/stores/preferences.store';
import { WardrobeStore } from '../../../core/stores/wardrobe.store';
import { WishlistStore } from '../../../core/stores/wishlist.store';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, TranslocoModule],
  templateUrl: './product-card.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  private preferencesStore = inject(PreferencesStore);
  private notificationService = inject(NotificationService);
  private translocoService = inject(TranslocoService);
  @Input({ required: true }) product!: ProductCardModel;
  @Output() onAddToCart = new EventEmitter<ProductCardModel>();
  @Output() onQuickView = new EventEmitter<ProductCardModel>();

  wishlistStore = inject(WishlistStore);
  wardrobeStore = inject(WardrobeStore);
  activeLang = this.preferencesStore.language;
  currencyCode = this.preferencesStore.currency;

  icons = {
    eye: faEye,
    heartSolid: faHeartSolid,
    heartRegular: faHeartRegular,
    wardrobe: faBookmark,
    bag: faShoppingBag,
  };

  isInWishlist(): boolean {
    return this.wishlistStore.ids().has(this.product.id);
  }

  toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistStore.toggle(this.product);
  }

  isInWardrobe(): boolean {
    return this.wardrobeStore.productIds().has(String(this.product.id));
  }

  saveToWardrobe(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.wardrobeStore.addProduct(this.product);
    this.notificationService.success(this.translocoService.translate('wardrobe.savedSuccessfully'));
  }

  quickView(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.onQuickView.emit(this.product);
  }

  addToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.onAddToCart.emit(this.product);
  }
}
