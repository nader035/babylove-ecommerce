import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ShopStore, ShopQueryState } from '../../shop.store';
import { CartStore } from '../../../../../../core/stores/cart.store';
import { PreferencesStore } from '../../../../../../core/stores/preferences.store';
import { WishlistStore } from '../../../../../../core/stores/wishlist.store';
import { ProductCard } from '../../../../../../shared/components/product-card/product-card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, ProductCard],
  templateUrl: './shop-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  preferencesStore = inject(PreferencesStore);
  shopStore = inject(ShopStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);
  private routeSub?: Subscription;
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;
  private isApplyingRouteState = false;

  activeLang = this.preferencesStore.language;
  currencyCode = this.preferencesStore.currency;

  noResults = computed(
    () => !this.shopStore.isLoading() && this.shopStore.filteredProducts().length === 0,
  );

  ngOnInit(): void {
    this.shopStore.loadCategories();
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      const rawPage = Number(params.get('page') || 1);
      const queryState: ShopQueryState = {
        category: params.get('category') || 'all',
        type: (params.get('type') || 'all').toLowerCase(),
        searchQuery: params.get('q') || '',
        sortBy: (params.get('sort') as ShopQueryState['sortBy']) || 'featured',
        page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
      };

      this.isApplyingRouteState = true;
      this.shopStore.applyQueryState(queryState);
      this.isApplyingRouteState = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }
  }

  onCategoryChange(slug: string): void {
    this.shopStore.setCategory(slug);
    this.syncUrlFromStore();
  }

  onTypeChange(type: string): void {
    this.shopStore.setType(type);
    this.syncUrlFromStore();
  }

  onSortChange(sortBy: ShopQueryState['sortBy']): void {
    this.shopStore.setSortBy(sortBy);
    this.syncUrlFromStore();
  }

  onSearchChange(query: string): void {
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }

    this.searchDebounceId = setTimeout(() => {
      this.shopStore.setSearchQuery(query);
      this.syncUrlFromStore();
    }, 220);
  }

  clearCategoryFilter(): void {
    this.onCategoryChange('all');
  }

  clearTypeFilter(): void {
    this.onTypeChange('all');
  }

  clearSearchFilter(): void {
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }
    this.shopStore.setSearchQuery('');
    this.syncUrlFromStore();
  }

  onNextPage(): void {
    this.shopStore.setPage(this.shopStore.page() + 1);
    this.syncUrlFromStore();
  }

  onPreviousPage(): void {
    this.shopStore.setPage(this.shopStore.page() - 1);
    this.syncUrlFromStore();
  }

  onGoToPage(page: number): void {
    this.shopStore.setPage(page);
    this.syncUrlFromStore();
  }

  onClearFilters(): void {
    this.shopStore.clearFilters();
    this.syncUrlFromStore();
  }

  private syncUrlFromStore(): void {
    if (this.isApplyingRouteState) {
      return;
    }

    const category = this.shopStore.activeCategory();
    const type = this.shopStore.activeType();
    const q = this.shopStore.searchQuery().trim();
    const sort = this.shopStore.sortBy();
    const page = this.shopStore.page();

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        category: category === 'all' ? null : category,
        type: type === 'all' ? null : type,
        q: q ? q : null,
        sort: sort === 'featured' ? null : sort,
        page: page > 1 ? page : null,
      },
      queryParamsHandling: '',
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }
}
