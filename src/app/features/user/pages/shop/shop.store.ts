import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { CategoryCardModel, CategoryService } from '../../../../core/services/category.service';
import { ProductCardModel, ProductService } from '../../../../core/services/product.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';

export type ShopState = {
  products: ProductCardModel[];
  categoryModels: CategoryCardModel[];
  isLoading: boolean;
  error: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  activeCategory: string; // The "Global Collection" (e.g., Menswear)
  activeType: string; // The "Product Type" (e.g., Knitwear)
  priceRange: { min: number; max: number };
  sortBy: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  quickViewProduct: ProductCardModel | null;
};

export type ShopQueryState = {
  category: string;
  type: string;
  searchQuery: string;
  sortBy: ShopState['sortBy'];
  page: number;
};

export const ShopStore = signalStore(
  { providedIn: 'root' },
  withState<ShopState>({
    products: [],
    categoryModels: [],
    isLoading: false,
    error: null,
    totalItems: 0,
    page: 1,
    pageSize: 12,
    searchQuery: '',
    activeCategory: 'all',
    activeType: 'all',
    priceRange: { min: 0, max: 1000 },
    sortBy: 'featured',
    quickViewProduct: null,
  }),
  withComputed(
    (
      {
        products,
        categoryModels,
        searchQuery,
        activeCategory,
        activeType,
        priceRange,
        sortBy,
        totalItems,
        page,
        pageSize,
      },
      preferencesStore = inject(PreferencesStore),
    ) => {
      const activeLang = preferencesStore.language;

      return {
        // High-end state: The actual category object being browsed
        activeCategoryModel: computed(
          () => categoryModels().find((c) => c.slug === activeCategory()) || null,
        ),

        availableTypeOptions: computed(() => {
          const lang = activeLang();
          const categories = categoryModels();
          const model = categories.find((c) => c.slug === activeCategory());

          const allOption = [{ value: 'all', label: '' }];

          const localizedTypeByCanonical = new Map<string, string>();
          for (const cat of categories) {
            const englishTypes = cat.en?.types ?? [];
            const localizedTypes = (lang === 'ar' ? cat.ar?.types : cat.en?.types) ?? [];

            englishTypes.forEach((englishType: string, index: number) => {
              const key = englishType.toLowerCase();
              if (!localizedTypeByCanonical.has(key)) {
                localizedTypeByCanonical.set(key, localizedTypes[index] ?? englishType);
              }
            });
          }

          if (model && model[lang]?.['types']) {
            const localizedTypes = model[lang]['types'];
            const englishTypes = model.en?.types ?? [];

            return [
              ...allOption,
              ...localizedTypes.map((label: string, index: number) => ({
                // Keep value canonical regardless of UI language, so filters keep working after lang switch.
                value: (englishTypes[index] ?? label).toLowerCase(),
                label,
              })),
            ];
          }

          // Global fallback (un-sorted unique types from current products)
          const unique = new Set(products().map((p) => p.type));
          return [
            ...allOption,
            ...Array.from(unique)
              .filter((t) => t !== '')
              .map((type) => ({
                value: type.toLowerCase(),
                label: localizedTypeByCanonical.get(type.toLowerCase()) ?? type,
              })),
          ];
        }),

        filteredProducts: computed(() => {
          const { min, max } = priceRange();

          return products()
            .filter((p) => {
              const priceMatch = p.price >= min && p.price <= max;
              return priceMatch;
            })
            .sort((a, b) => {
              switch (sortBy()) {
                case 'priceAsc':
                  return a.price - b.price;
                case 'priceDesc':
                  return b.price - a.price;
                case 'rating':
                  return b.rating - a.rating;
                default:
                  return 0;
              }
            });
        }),

        totalPages: computed(() => Math.max(1, Math.ceil(totalItems() / pageSize()))),
        hasPreviousPage: computed(() => page() > 1),
        hasNextPage: computed(() => page() < Math.max(1, Math.ceil(totalItems() / pageSize()))),
      };
    },
  ),
  withMethods(
    (store, productService = inject(ProductService), categoryService = inject(CategoryService)) => {
      const fetchProducts = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            productService
              .getProductsPage({
                categorySlug: store.activeCategory(),
                type: store.activeType(),
                searchQuery: store.searchQuery(),
                sortBy: store.sortBy(),
                page: store.page(),
                pageSize: store.pageSize(),
              })
              .pipe(
                tapResponse({
                  next: (response) =>
                    patchState(store, {
                      products: response.items,
                      totalItems: response.total,
                      page: response.page,
                      pageSize: response.pageSize,
                      isLoading: false,
                    }),
                  error: (error: Error) =>
                    patchState(store, { error: error.message, isLoading: false }),
                }),
              ),
          ),
        ),
      );

      return {
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
        loadProducts: fetchProducts,

        applyQueryState: (query: ShopQueryState) => {
          patchState(store, {
            activeCategory: query.category,
            activeType: query.type,
            searchQuery: query.searchQuery,
            sortBy: query.sortBy,
            page: query.page,
          });
          fetchProducts();
        },

        // Global navigation (Top Bar)
        setCategory: (slug: string) => {
          patchState(store, {
            activeCategory: slug,
            activeType: 'all',
            page: 1,
          });
          fetchProducts();
        },

        // Grid refinement (Sidebar)
        setType: (type: string) => {
          patchState(store, { activeType: type.toLowerCase(), page: 1 });
          fetchProducts();
        },

        setPriceRange: (min: number, max: number) =>
          patchState(store, { priceRange: { min, max } }),

        setSortBy: (sortBy: ShopState['sortBy']) => {
          patchState(store, { sortBy, page: 1 });
          fetchProducts();
        },
        setSearchQuery: (searchQuery: string) => {
          patchState(store, { searchQuery, page: 1 });
          fetchProducts();
        },

        setPage: (nextPage: number) => {
          const totalPages = Math.max(1, Math.ceil(store.totalItems() / store.pageSize()));
          const safePage = Math.min(Math.max(1, nextPage), totalPages);
          patchState(store, { page: safePage });
          fetchProducts();
        },

        clearFilters: () => {
          patchState(store, {
            activeCategory: 'all',
            activeType: 'all',
            searchQuery: '',
            priceRange: { min: 0, max: 1000 },
            sortBy: 'featured',
            page: 1,
          });
          fetchProducts();
        },

        openQuickView: (product: ProductCardModel) =>
          patchState(store, { quickViewProduct: product }),
        closeQuickView: () => patchState(store, { quickViewProduct: null }),
      };
    },
  ),
);
