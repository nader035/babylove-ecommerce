import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { TranslocoService } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryCardModel, CategoryService } from '../../../../core/services/category.service';

export type CategoryState = {
  categories: CategoryCardModel[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeType: string;
  sortBy: 'featured' | 'az' | 'za';
  quickViewCategory: CategoryCardModel | null;
};

export type CategoryQueryState = {
  category: string;
  q: string;
  sortBy: CategoryState['sortBy'];
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
  withComputed(
    ({ categories, searchQuery, activeType, sortBy }, transloco = inject(TranslocoService)) => {
      const activeLang = toSignal(transloco.langChanges$, {
        initialValue: transloco.getActiveLang(),
      });

      return {
        categoryCount: computed(() => categories().length),
        availableCategoryFilters: computed(() => {
          const lang = activeLang();
          return categories().map((cat) => ({
            value: cat.slug,
            label: cat[lang]?.title || cat.slug,
          }));
        }),
        filteredCategories: computed(() => {
          const query = searchQuery().trim().toLowerCase();
          const lang = activeLang();

          const byType = categories().filter((cat) => {
            return activeType() === 'all' || activeType() === cat.slug;
          });

          const searched = byType.filter((cat) => {
            const content = cat[lang];
            return content ? content.title.toLowerCase().includes(query) : false;
          });

          if (sortBy() === 'az') {
            return [...searched].sort((a, b) => {
              const titleA = a[lang]?.title || '';
              const titleB = b[lang]?.title || '';
              return titleA.localeCompare(titleB);
            });
          }
          if (sortBy() === 'za') {
            return [...searched].sort((a, b) => {
              const titleA = a[lang]?.title || '';
              const titleB = b[lang]?.title || '';
              return titleB.localeCompare(titleA);
            });
          }
          return searched;
        }),
      };
    },
  ),
  withMethods((categoryStore, categoryService = inject(CategoryService)) => ({
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => patchState(categoryStore, { isLoading: true, error: null })),
        switchMap(() =>
          categoryService.getCategories().pipe(
            tapResponse({
              next: (categories) =>
                patchState(categoryStore, { categories: categories, isLoading: false }),
              error: (error: Error) =>
                patchState(categoryStore, { error: error.message, isLoading: false }),
            }),
          ),
        ),
      ),
    ),
    updateSearchQuery: (query: string) => patchState(categoryStore, { searchQuery: query }),
    updateActiveType: (type: string) => patchState(categoryStore, { activeType: type }),
    updateSortBy: (sort: CategoryState['sortBy']) => patchState(categoryStore, { sortBy: sort }),
    applyQueryState: (query: CategoryQueryState) =>
      patchState(categoryStore, {
        activeType: query.category,
        searchQuery: query.q,
        sortBy: query.sortBy,
      }),
    openQuickView: (category: CategoryCardModel) =>
      patchState(categoryStore, { quickViewCategory: category }),
    closeQuickView: () => patchState(categoryStore, { quickViewCategory: null }),
    clearFilters: () =>
      patchState(categoryStore, { activeType: 'all', sortBy: 'featured', searchQuery: '' }),
  })),
);
