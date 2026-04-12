import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faHeart as faHeartSolid, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ProductCardModel } from '../../../core/services/product.service';
import { PreferencesStore } from '../../../core/stores/preferences.store';
import { WishlistStore } from '../../../core/stores/wishlist.store';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, TranslocoModule],
  templateUrl: './product-card.html',
  styleUrls: [],
})
export class ProductCard {
  private translocoService = inject(TranslocoService);
  private preferencesStore = inject(PreferencesStore);
  @Input({ required: true }) product!: ProductCardModel;
  @Output() onAddToCart = new EventEmitter<ProductCardModel>();
  @Output() onQuickView = new EventEmitter<ProductCardModel>();

  wishlistStore = inject(WishlistStore);

  get activeLang(): 'en' | 'ar' {
    return this.translocoService.getActiveLang() === 'ar' ? 'ar' : 'en';
  }

  get currencyCode() {
    return this.preferencesStore.currency();
  }

  icons = {
    eye: faEye,
    heartSolid: faHeartSolid,
    heartRegular: faHeartRegular,
    bag: faShoppingBag,
  };

  toggleWishlist(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.wishlistStore.toggle(this.product);
  }

  quickView(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.onQuickView.emit(this.product);
  }

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.onAddToCart.emit(this.product);
  }
}
