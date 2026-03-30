import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ShopStore } from '../../shop.store';
import { CartStore } from '../../../../core/stores/cart.store';
import { WishlistStore } from '../../../../core/stores/wishlist.store';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink],
  templateUrl: './shop-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage implements OnInit {
  private route = inject(ActivatedRoute);
  shopStore = inject(ShopStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);

  noResults = computed(
    () => !this.shopStore.isLoading() && this.shopStore.filteredProducts().length === 0,
  );

  ngOnInit(): void {
    this.shopStore.loadProducts();
    this.route.queryParamMap.subscribe((params) => {
      const category = params.get('category');
      if (category) {
        this.shopStore.setCategory(category);
      }
    });
  }
}
