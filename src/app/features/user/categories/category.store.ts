import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { CategoryCardModel, CategoryService } from '../../../core/services/category.service';
import { tapResponse } from '@ngrx/operators';
export type CategoryState = {
  categories: CategoryCardModel[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeType: 'all' | 'essentials' | 'fashion' | 'gear';
  sortBy: 'featured' | 'az' | 'za';
  quickViewCategory: CategoryCardModel | null;
};

export const categoryStore = signalStore(
  {
    providedIn: 'root',
  },
  withState({
    categories: [],
    searchQuery: '',
    isLoading: false,
    error: null,
    activeType: 'all',
    sortBy: 'featured',
    quickViewCategory: null,
  } as CategoryState),
  withComputed(({ categories, searchQuery, activeType, sortBy }) => ({
    categoryCount: computed(() => categories().length),
    filteredCategories: computed(() => {
      const query = searchQuery().trim().toLowerCase();
      const byType = categories().filter((cat) => {
        if (activeType() === 'all') {
          return true;
        }
        if (activeType() === 'fashion') {
          return ['women', 'men', 'girl', 'boy'].includes(cat.slug);
        }
        if (activeType() === 'essentials') {
          return ['baby', 'plus-size'].includes(cat.slug);
        }
        return ['baby', 'boy'].includes(cat.slug);
      });
      const searched = byType.filter((cat) => cat.name.toLowerCase().includes(query));

      if (sortBy() === 'az') {
        return [...searched].sort((a, b) => a.name.localeCompare(b.name));
      }
      if (sortBy() === 'za') {
        return [...searched].sort((a, b) => b.name.localeCompare(a.name));
      }
      return searched;
    }),
  })),
  withMethods((categoryStore, categoryService = inject(CategoryService)) => ({
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => patchState(categoryStore, { isLoading: true, error: null })),
        switchMap(() =>
          categoryService.getCategories().pipe(
            tapResponse({
              next: (categories) => patchState(categoryStore, { categories: categories, isLoading: false }),
              error: (error: Error) =>
                patchState(categoryStore, { error: error.message, isLoading: false }),
            }),
          ),
        ),
      ),
    ),
    updateSearchQuery: (query: string) => patchState(categoryStore, { searchQuery: query }),
    updateActiveType: (type: CategoryState['activeType']) => patchState(categoryStore, { activeType: type }),
    updateSortBy: (sort: CategoryState['sortBy']) => patchState(categoryStore, { sortBy: sort }),
    openQuickView: (category: CategoryCardModel) =>
      patchState(categoryStore, { quickViewCategory: category }),
    closeQuickView: () => patchState(categoryStore, { quickViewCategory: null }),
    clearFilters: () => patchState(categoryStore, { activeType: 'all', sortBy: 'featured', searchQuery: '' }),
  })),
);
