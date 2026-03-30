import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, filter, of, pipe, switchMap, tap } from 'rxjs';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/constants/mock-data';
import { tapResponse } from '@ngrx/operators';
export type CategoryState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
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
  } as CategoryState),
  withComputed(({ categories, searchQuery }) => ({
    categoryCount: computed(() => categories().length),
    filteredCategories: computed(() => {
      const query = searchQuery().toLowerCase();
      return categories().filter((cat) => cat.name.toLowerCase().includes(query));
    }),
  })),
  withMethods((categoryStore, categoryService = inject(CategoryService)) => ({
    loadCategories: rxMethod<void>(
      pipe(
        tap(() => {
          console.log('1. Load Started'); // هل دي بتظهر بعد الريفرش؟
          patchState(categoryStore, { isLoading: true, error: null });
        }),
        switchMap(() =>
          categoryService.getCategories().pipe(
            tap((res) => console.log('2. Data Received:', res)), // هل الداتا وصلت؟
            tapResponse({
              next: (categories) => {
                console.log('3. Patching State');
                patchState(categoryStore, { categories: categories, isLoading: false });
              },
              error: (error: Error) =>
                patchState(categoryStore, { error: error.message, isLoading: false }),
            }),
          ),
        ),
      ),
    ),
    updateSearchQuery: (query: string) => patchState(categoryStore, { searchQuery: query }),
  })),
);
