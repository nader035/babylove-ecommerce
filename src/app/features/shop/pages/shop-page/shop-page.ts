import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShopStore } from '../../shop.store';
import { CartStore } from '../../../../core/stores/cart.store';
import { WishlistStore } from '../../../../core/stores/wishlist.store';
import { PreferencesStore } from '../../../../core/stores/preferences.store';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, ProductCard],
  templateUrl: './shop-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage implements OnInit {
  private route = inject(ActivatedRoute);
  private preferencesStore = inject(PreferencesStore);
  shopStore = inject(ShopStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);

  activeLang = this.preferencesStore.language;

  noResults = computed(
    () => !this.shopStore.isLoading() && this.shopStore.filteredProducts().length === 0,
  );

  ngOnInit(): void {
    this.shopStore.loadProducts();
    this.shopStore.loadCategories();
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      const type = params.get('type');
      if (category) {
        this.shopStore.setCategory(category);
      } 
      if (type) {
        this.shopStore.setType(type);
      }
    });
  }
}
