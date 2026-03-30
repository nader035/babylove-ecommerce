import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { ProductCardModel, ProductService } from '../../core/services/product.service';

export type ShopState = {
  products: ProductCardModel[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeCategory: string;
  sortBy: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  quickViewProduct: ProductCardModel | null;
};

export const ShopStore = signalStore(
  { providedIn: 'root' },
  withState<ShopState>({
    products: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    activeCategory: 'all',
    sortBy: 'featured',
    quickViewProduct: null,
  }),
  withComputed(({ products, searchQuery, activeCategory, sortBy }) => ({
    categories: computed(() => {
      const unique = new Set(products().map((product) => product.categorySlug));
      return ['all', ...unique];
    }),
    filteredProducts: computed(() => {
      const query = searchQuery().trim().toLowerCase();
      const filtered = products().filter((product) => {
        const categoryMatches =
          activeCategory() === 'all' || product.categorySlug === activeCategory();
        const searchMatches =
          product.title.toLowerCase().includes(query) ||
          product.shortDescription.toLowerCase().includes(query);
        return categoryMatches && searchMatches;
      });
      if (sortBy() === 'priceAsc') {
        return [...filtered].sort((a, b) => a.price - b.price);
      }
      if (sortBy() === 'priceDesc') {
        return [...filtered].sort((a, b) => b.price - a.price);
      }
      if (sortBy() === 'rating') {
        return [...filtered].sort((a, b) => b.rating - a.rating);
      }
      return filtered;
    }),
  })),
  withMethods((store, productService = inject(ProductService)) => ({
    loadProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          productService.getProducts().pipe(
            tapResponse({
              next: (products) => patchState(store, { products, isLoading: false }),
              error: (error: Error) =>
                patchState(store, { error: error.message, isLoading: false }),
            }),
          ),
        ),
      ),
    ),
    setSearchQuery: (searchQuery: string) => patchState(store, { searchQuery }),
    setCategory: (activeCategory: string) => patchState(store, { activeCategory }),
    setSortBy: (sortBy: ShopState['sortBy']) => patchState(store, { sortBy }),
    clearFilters: () =>
      patchState(store, { searchQuery: '', activeCategory: 'all', sortBy: 'featured' }),
    openQuickView: (quickViewProduct: ProductCardModel) => patchState(store, { quickViewProduct }),
    closeQuickView: () => patchState(store, { quickViewProduct: null }),
  })),
);
