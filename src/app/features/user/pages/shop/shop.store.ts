import { computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { TranslocoService } from '@jsverse/transloco';
import { CategoryCardModel, CategoryService } from '../../../../core/services/category.service';
import { ProductCardModel, ProductService } from '../../../../core/services/product.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';


export type ShopState = {
  products: ProductCardModel[];
  categoryModels: CategoryCardModel[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  activeCategory: string; // The "Global Collection" (e.g., Menswear)
  activeType: string;     // The "Product Type" (e.g., Knitwear)
  priceRange: { min: number; max: number };
  sortBy: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  quickViewProduct: ProductCardModel | null;
};

export const ShopStore = signalStore(
  { providedIn: 'root' },
  withState<ShopState>({
    products: [],
    categoryModels: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    activeCategory: 'all',
    activeType: 'all',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'featured',
    quickViewProduct: null,
  }),
  withComputed(
    (
      { products, categoryModels, searchQuery, activeCategory, activeType, priceRange, sortBy },
      preferencesStore = inject(PreferencesStore),
    ) => {
      const activeLang = preferencesStore.language;

      return {
        // High-end state: The actual category object being browsed
        activeCategoryModel: computed(() => 
          categoryModels().find(c => c.slug === activeCategory()) || null
        ),

        // Intelligent refinement list: Shows types ONLY relevant to the active context
        availableTypes: computed(() => {
          const lang = activeLang();
          const model = categoryModels().find(c => c.slug === activeCategory());
          
          if (model && model[lang]?.['types']) {
             return model[lang]['types'];
          }

          // Global fallback (un-sorted unique types from current products)
          const unique = new Set(products().map(p => p.type));
          return Array.from(unique).filter(t => t !== '');
        }),

        filteredProducts: computed(() => {
          const query = searchQuery().trim().toLowerCase();
          const lang = activeLang();
          const { min, max } = priceRange();
          
          return products()
            .filter((p) => {
              const catMatch = activeCategory() === 'all' || p.categorySlug === activeCategory();
              const typeMatch = activeType() === 'all' || p.type.toLowerCase() === activeType().toLowerCase();
              const priceMatch = p.price >= min && p.price <= max;
              const searchMatch = !query || 
                p[lang]?.['title']?.toLowerCase().includes(query) ||
                p[lang]?.['shortDescription']?.toLowerCase().includes(query);

              return catMatch && typeMatch && priceMatch && searchMatch;
            })
            .sort((a, b) => {
              switch(sortBy()) {
                case 'priceAsc': return a.price - b.price;
                case 'priceDesc': return b.price - a.price;
                case 'rating': return b.rating - a.rating;
                default: return 0;
              }
            });
        }),
      };
    },
  ),
  withMethods(
    (
      store,
      productService = inject(ProductService),
      categoryService = inject(CategoryService),
    ) => ({
      loadCategories: rxMethod<void>(
        pipe(
          switchMap(() =>
            categoryService.getCategories().pipe(
              tapResponse({
                next: (cats) => patchState(store, { categoryModels: cats }),
                error: (error: Error) => patchState(store, { error: error.message }),
              }),
            ),
          ),
        ),
      ),
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
      
      // Global navigation (Top Bar)
      setCategory: (slug: string) => patchState(store, { 
        activeCategory: slug, 
        activeType: 'all',  // Reset refinement on collection change
        searchQuery: ''      // Clear local search to focus on the collection
      }),

      // Grid refinement (Sidebar)
      setType: (type: string) => patchState(store, { activeType: type }),
      
      setPriceRange: (min: number, max: number) => patchState(store, { priceRange: { min, max } }),
      
      setSortBy: (sortBy: ShopState['sortBy']) => patchState(store, { sortBy }),
      setSearchQuery: (searchQuery: string) => patchState(store, { searchQuery }),

      clearFilters: () => patchState(store, { 
        activeCategory: 'all', 
        activeType: 'all', 
        searchQuery: '',
        priceRange: { min: 0, max: 1000 },
        sortBy: 'featured' 
      }),
        
      openQuickView: (product: ProductCardModel) => patchState(store, { quickViewProduct: product }),
      closeQuickView: () => patchState(store, { quickViewProduct: null }),
    }),
  ),
);
