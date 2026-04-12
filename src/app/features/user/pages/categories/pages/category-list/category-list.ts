import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { CategoryQueryState, categoryStore } from '../../category.store';
import { PreferencesStore } from '../../../../../../core/stores/preferences.store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList implements OnInit, OnDestroy {
  categoryStore = inject(categoryStore);
  activeLang = inject(PreferencesStore).language;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private routeSub?: Subscription;
  private searchDebounceId: ReturnType<typeof setTimeout> | null = null;
  private isApplyingRouteState = false;

  filterOptions = computed(() => [
    { value: 'all', labelKey: 'common.all', label: '' },
    ...this.categoryStore.availableCategoryFilters().map((item) => ({
      value: item.value,
      labelKey: '',
      label: item.label,
    })),
  ]);

  sortOptions = [
    { label: 'shop.filters.sort.featured', value: 'featured' },
    { label: 'shop.filters.sort.az', value: 'az' },
    { label: 'shop.filters.sort.za', value: 'za' },
  ];

  ngOnInit(): void {
    this.categoryStore.loadCategories();
    this.routeSub = this.route.queryParamMap.subscribe((params) => {
      const query: CategoryQueryState = {
        category: params.get('category') || 'all',
        q: params.get('q') || '',
        sortBy: (params.get('sort') as CategoryQueryState['sortBy']) || 'featured',
      };

      this.isApplyingRouteState = true;
      this.categoryStore.applyQueryState(query);
      this.isApplyingRouteState = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }

    this.searchDebounceId = setTimeout(() => {
      this.categoryStore.updateSearchQuery(input.value);
      this.syncUrlFromStore();
    }, 220);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.categoryStore.updateSortBy(select.value as CategoryQueryState['sortBy']);
    this.syncUrlFromStore();
  }

  onFilterChange(value: string): void {
    this.categoryStore.updateActiveType(value);
    this.syncUrlFromStore();
  }

  onClearFilters(): void {
    this.categoryStore.clearFilters();
    this.syncUrlFromStore();
  }

  hasNoResults = computed(() => {
    return !this.categoryStore.isLoading() && this.categoryStore.filteredCategories().length === 0;
  });

  hasActiveFilters = computed(() => {
    return (
      this.categoryStore.activeType() !== 'all' || this.categoryStore.searchQuery().trim() !== ''
    );
  });

  clearSearchFilter(): void {
    if (this.searchDebounceId) {
      clearTimeout(this.searchDebounceId);
    }
    this.categoryStore.updateSearchQuery('');
    this.syncUrlFromStore();
  }

  clearCategoryFilter(): void {
    this.categoryStore.updateActiveType('all');
    this.syncUrlFromStore();
  }

  private syncUrlFromStore(): void {
    if (this.isApplyingRouteState) {
      return;
    }

    const category = this.categoryStore.activeType();
    const q = this.categoryStore.searchQuery().trim();
    const sort = this.categoryStore.sortBy();

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        category: category === 'all' ? null : category,
        q: q ? q : null,
        sort: sort === 'featured' ? null : sort,
      },
      queryParamsHandling: '',
    });
    this.location.replaceState(this.router.serializeUrl(urlTree));
  }
}
