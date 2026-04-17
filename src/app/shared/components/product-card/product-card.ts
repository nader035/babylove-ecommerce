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
import { faEye, faHeart as faHeartSolid, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { TranslocoModule } from '@jsverse/transloco';
import { ProductCardModel } from '../../../core/services/product.service';
import { PreferencesStore } from '../../../core/stores/preferences.store';
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
  @Input({ required: true }) product!: ProductCardModel;
  @Output() onAddToCart = new EventEmitter<ProductCardModel>();
  @Output() onQuickView = new EventEmitter<ProductCardModel>();

  wishlistStore = inject(WishlistStore);
  activeLang = this.preferencesStore.language;
  currencyCode = this.preferencesStore.currency;

  icons = {
    eye: faEye,
    heartSolid: faHeartSolid,
    heartRegular: faHeartRegular,
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
