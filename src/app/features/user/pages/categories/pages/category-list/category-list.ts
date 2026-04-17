import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryQueryState, categoryStore } from '../../category.store';
import { PreferencesStore } from '../../../../../../core/stores/preferences.store';
import { Subject, debounceTime, distinctUntilChanged, map } from 'rxjs';

const CATEGORY_SORT_VALUES: CategoryQueryState['sortBy'][] = ['featured', 'az', 'za'];

const isValidSortBy = (value: string | null): value is CategoryQueryState['sortBy'] => {
  return !!value && CATEGORY_SORT_VALUES.includes(value as CategoryQueryState['sortBy']);
};

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList {
  categoryStore = inject(categoryStore);
  activeLang = inject(PreferencesStore).language;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private searchInput$ = new Subject<string>();
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

  constructor() {
    this.searchInput$
      .pipe(
        map((value) => value.trim()),
        debounceTime(240),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((query) => {
        this.categoryStore.updateSearchQuery(query);
        this.syncUrlFromStore();
      });

    this.categoryStore.loadCategories();

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const rawSort = params.get('sort');
      const query: CategoryQueryState = {
        category: params.get('category') || 'all',
        q: params.get('q') || '',
        sortBy: isValidSortBy(rawSort) ? rawSort : 'featured',
      };

      this.isApplyingRouteState = true;
      this.categoryStore.applyQueryState(query);
      this.isApplyingRouteState = false;
    });
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchInput$.next(input.value);
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
