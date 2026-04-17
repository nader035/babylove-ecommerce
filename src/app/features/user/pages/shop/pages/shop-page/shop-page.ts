import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ShopStore, ShopQueryState } from '../../shop.store';
import { CartStore } from '../../../../../../core/stores/cart.store';
import { PreferencesStore } from '../../../../../../core/stores/preferences.store';
import { WishlistStore } from '../../../../../../core/stores/wishlist.store';
import { ProductCard } from '../../../../../../shared/components/product-card/product-card';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';

const SHOP_SORT_VALUES: ShopQueryState['sortBy'][] = [
  'featured',
  'priceAsc',
  'priceDesc',
  'rating',
];

const isValidSortBy = (value: string | null): value is ShopQueryState['sortBy'] => {
  return !!value && SHOP_SORT_VALUES.includes(value as ShopQueryState['sortBy']);
};

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, ProductCard],
  templateUrl: './shop-page.html',
  styleUrl: './shop-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private searchInput$ = new Subject<string>();
  private priceInput$ = new Subject<{ min: number; max: number }>();
  preferencesStore = inject(PreferencesStore);
  shopStore = inject(ShopStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);
  private isApplyingRouteState = false;
  priceDraftMin = signal(0);
  priceDraftMax = signal(1000);

  activeLang = this.preferencesStore.language;
  currencyCode = this.preferencesStore.currency;

  noResults = computed(
    () => !this.shopStore.isLoading() && this.shopStore.filteredProducts().length === 0,
  );
  showingFrom = computed(() => {
    if (this.shopStore.totalItems() === 0) {
      return 0;
    }

    return (this.shopStore.page() - 1) * this.shopStore.pageSize() + 1;
  });
  showingTo = computed(() =>
    Math.min(this.shopStore.totalItems(), this.shopStore.page() * this.shopStore.pageSize()),
  );

  constructor() {
    this.searchInput$
      .pipe(
        map((value) => value.trim()),
        debounceTime(260),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((query) => {
        this.shopStore.setSearchQuery(query);
        this.syncUrlFromStore();
      });

    this.priceInput$
      .pipe(
        map(({ min, max }) => ({ min: Math.round(min), max: Math.round(max) })),
        debounceTime(260),
        distinctUntilChanged(
          (prev, current) => prev.min === current.min && prev.max === current.max,
        ),
        takeUntilDestroyed(),
      )
      .subscribe(({ min, max }) => {
        this.shopStore.setPriceRange(min, max);
        this.syncUrlFromStore();
      });

    effect(
      () => {
        this.priceDraftMin.set(this.shopStore.effectiveMinPrice());
        this.priceDraftMax.set(this.shopStore.effectiveMaxPrice());
      },
      { allowSignalWrites: true },
    );

    this.shopStore.loadCategories();
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const rawPage = Number(params.get('page') || 1);
      const rawMin = Number(params.get('min'));
      const rawMax = Number(params.get('max'));
      const rawSort = params.get('sort');
      const queryState: ShopQueryState = {
        category: params.get('category') || 'all',
        type: (params.get('type') || 'all').toLowerCase(),
        searchQuery: params.get('q') || '',
        sortBy: isValidSortBy(rawSort) ? rawSort : 'featured',
        page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
        minPrice: Number.isFinite(rawMin) ? rawMin : null,
        maxPrice: Number.isFinite(rawMax) ? rawMax : null,
      };

      this.isApplyingRouteState = true;
      this.shopStore.applyQueryState(queryState);
      this.isApplyingRouteState = false;
    });
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
    this.searchInput$.next(query);
  }

  clearCategoryFilter(): void {
    this.onCategoryChange('all');
  }

  clearTypeFilter(): void {
    this.onTypeChange('all');
  }

  clearSearchFilter(): void {
    this.shopStore.setSearchQuery('');
    this.syncUrlFromStore();
  }

  onMinPriceInput(value: number): void {
    const nextMin = Math.min(value, this.priceDraftMax());
    this.priceDraftMin.set(nextMin);
    this.priceInput$.next({ min: nextMin, max: this.priceDraftMax() });
  }

  onMaxPriceInput(value: number): void {
    const nextMax = Math.max(value, this.priceDraftMin());
    this.priceDraftMax.set(nextMax);
    this.priceInput$.next({ min: this.priceDraftMin(), max: nextMax });
  }

  onClearPriceFilter(): void {
    this.shopStore.clearPriceRange();
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
    const min = this.shopStore.selectedMinPrice();
    const max = this.shopStore.selectedMaxPrice();

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        category: category === 'all' ? null : category,
        type: type === 'all' ? null : type,
        q: q ? q : null,
        sort: sort === 'featured' ? null : sort,
        page: page > 1 ? page : null,
        min: min !== null ? min : null,
        max: max !== null ? max : null,
      },
      queryParamsHandling: '',
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }
}
