import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { CategoryCardModel, CategoryService } from '../../../../core/services/category.service';
import {
  PriceBounds,
  ProductCardModel,
  ProductService,
} from '../../../../core/services/product.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';

export type ShopState = {
  products: ProductCardModel[];
  categoryModels: CategoryCardModel[];
  isLoading: boolean;
  isLoadingBounds: boolean;
  error: string | null;
  totalItems: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  activeCategory: string;
  activeType: string;
  priceBounds: PriceBounds;
  selectedMinPrice: number | null;
  selectedMaxPrice: number | null;
  sortBy: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  quickViewProduct: ProductCardModel | null;
};

export type ShopQueryState = {
  category: string;
  type: string;
  searchQuery: string;
  sortBy: ShopState['sortBy'];
  page: number;
  minPrice: number | null;
  maxPrice: number | null;
};

const clampPrice = (value: number | null, bounds: PriceBounds): number | null => {
  if (value === null || !Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value);
  return Math.min(bounds.max, Math.max(bounds.min, rounded));
};

const normalizePriceRange = (
  minPrice: number | null,
  maxPrice: number | null,
  bounds: PriceBounds,
): { min: number | null; max: number | null } => {
  const nextMin = clampPrice(minPrice, bounds);
  const nextMax = clampPrice(maxPrice, bounds);

  if (nextMin !== null && nextMax !== null && nextMin > nextMax) {
    return { min: bounds.min, max: bounds.max };
  }

  return { min: nextMin, max: nextMax };
};

export const ShopStore = signalStore(
  { providedIn: 'root' },
  withState<ShopState>({
    products: [],
    categoryModels: [],
    isLoading: false,
    isLoadingBounds: false,
    error: null,
    totalItems: 0,
    page: 1,
    pageSize: 12,
    searchQuery: '',
    activeCategory: 'all',
    activeType: 'all',
    priceBounds: { min: 0, max: 1000 },
    selectedMinPrice: null,
    selectedMaxPrice: null,
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
        priceBounds,
        selectedMinPrice,
        selectedMaxPrice,
        sortBy,
        totalItems,
        page,
        pageSize,
      },
      preferencesStore = inject(PreferencesStore),
    ) => {
      const activeLang = preferencesStore.language;

      return {
        activeCategoryModel: computed(
          () => categoryModels().find((c) => c.slug === activeCategory()) || null,
        ),

        availableTypeOptions: computed(() => {
          const lang = activeLang();
          const categories = categoryModels();
          const model = categories.find((c) => c.slug === activeCategory());
          const toTitleCase = (value: string) =>
            value
              .split('-')
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ');

          const allOption = [{ value: 'all', label: '' }];

          const localizedTypeByCanonical = new Map<string, string>();
          for (const cat of categories) {
            const englishTypes = cat.en?.types ?? [];
            const canonicalKeys =
              cat.typeKeys.length > 0
                ? cat.typeKeys
                : englishTypes.map((englishType: string) => englishType.toLowerCase());
            const localizedTypes = (lang === 'ar' ? cat.ar?.types : cat.en?.types) ?? [];

            canonicalKeys.forEach((key: string, index: number) => {
              const normalizedKey = key.toLowerCase();
              if (!localizedTypeByCanonical.has(normalizedKey)) {
                localizedTypeByCanonical.set(
                  normalizedKey,
                  localizedTypes[index] ?? englishTypes[index] ?? toTitleCase(normalizedKey),
                );
              }
            });
          }

          if (model && model[lang]?.['types']) {
            const localizedTypes = model[lang]['types'];
            const englishTypes = model.en?.types ?? [];
            const canonicalKeys =
              model.typeKeys.length > 0
                ? model.typeKeys
                : englishTypes.map((englishType: string) => englishType.toLowerCase());

            return [
              ...allOption,
              ...canonicalKeys.map((key: string, index: number) => {
                const normalizedKey = key.toLowerCase();
                return {
                  value: normalizedKey,
                  label:
                    localizedTypes[index] ??
                    localizedTypeByCanonical.get(normalizedKey) ??
                    englishTypes[index] ??
                    toTitleCase(normalizedKey),
                };
              }),
            ];
          }

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

        activeTypeLabel: computed(() => {
          const selected = activeType();
          return (
            (selected !== 'all'
              ? categoryModels()
                  .flatMap((category) => {
                    const lang = activeLang();
                    const englishTypes = category.en?.types ?? [];
                    const canonicalKeys =
                      category.typeKeys.length > 0
                        ? category.typeKeys
                        : englishTypes.map((englishType: string) => englishType.toLowerCase());
                    const localizedTypes =
                      (lang === 'ar' ? category.ar?.types : category.en?.types) ?? [];

                    return canonicalKeys.map((key: string, index: number) => ({
                      value: key.toLowerCase(),
                      label: localizedTypes[index] ?? englishTypes[index] ?? key,
                    }));
                  })
                  .find((item) => item.value === selected)?.label
              : null) ?? selected
          );
        }),

        effectiveMinPrice: computed(() => selectedMinPrice() ?? priceBounds().min),
        effectiveMaxPrice: computed(() => selectedMaxPrice() ?? priceBounds().max),

        filteredProducts: computed(() => {
          const list = [...products()];

          if (sortBy() === 'priceAsc') {
            return list.sort((a, b) => a.price - b.price);
          }

          if (sortBy() === 'priceDesc') {
            return list.sort((a, b) => b.price - a.price);
          }

          if (sortBy() === 'rating') {
            return list.sort((a, b) => b.rating - a.rating);
          }

          return list;
        }),

        totalPages: computed(() => Math.max(1, Math.ceil(totalItems() / pageSize()))),
        hasPreviousPage: computed(() => page() > 1),
        hasNextPage: computed(() => page() < Math.max(1, Math.ceil(totalItems() / pageSize()))),

        paginationPages: computed(() => {
          const current = page();
          const total = Math.max(1, Math.ceil(totalItems() / pageSize()));
          const windowSize = 2;
          const start = Math.max(1, current - windowSize);
          const end = Math.min(total, current + windowSize);

          const pages: number[] = [];
          for (let i = start; i <= end; i += 1) {
            pages.push(i);
          }
          return pages;
        }),

        hasActiveFilters: computed(
          () =>
            activeCategory() !== 'all' ||
            activeType() !== 'all' ||
            searchQuery().trim() !== '' ||
            selectedMinPrice() !== null ||
            selectedMaxPrice() !== null,
        ),
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
                minPrice: store.selectedMinPrice() ?? undefined,
                maxPrice: store.selectedMaxPrice() ?? undefined,
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

      const fetchPriceBounds = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoadingBounds: true })),
          switchMap(() =>
            productService
              .getPriceBounds({
                categorySlug: store.activeCategory(),
                type: store.activeType(),
                searchQuery: store.searchQuery(),
              })
              .pipe(
                tapResponse({
                  next: (bounds) => {
                    const safeBounds = {
                      min: Number.isFinite(bounds.min) ? Math.round(bounds.min) : 0,
                      max: Number.isFinite(bounds.max) ? Math.round(bounds.max) : 0,
                    };

                    const normalized = normalizePriceRange(
                      store.selectedMinPrice(),
                      store.selectedMaxPrice(),
                      safeBounds,
                    );

                    patchState(store, {
                      priceBounds: safeBounds,
                      selectedMinPrice: normalized.min,
                      selectedMaxPrice: normalized.max,
                      isLoadingBounds: false,
                    });
                  },
                  error: () => patchState(store, { isLoadingBounds: false }),
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
        loadPriceBounds: fetchPriceBounds,
        loadProducts: fetchProducts,

        applyQueryState: (query: ShopQueryState) => {
          patchState(store, {
            activeCategory: query.category,
            activeType: query.type,
            searchQuery: query.searchQuery,
            sortBy: query.sortBy,
            page: query.page,
            selectedMinPrice: query.minPrice,
            selectedMaxPrice: query.maxPrice,
          });

          fetchPriceBounds();
          fetchProducts();
        },

        setCategory: (slug: string) => {
          patchState(store, {
            activeCategory: slug,
            activeType: 'all',
            page: 1,
            selectedMinPrice: null,
            selectedMaxPrice: null,
          });

          fetchPriceBounds();
          fetchProducts();
        },

        setType: (type: string) => {
          patchState(store, {
            activeType: type.toLowerCase(),
            page: 1,
            selectedMinPrice: null,
            selectedMaxPrice: null,
          });

          fetchPriceBounds();
          fetchProducts();
        },

        setPriceRange: (min: number | null, max: number | null) => {
          const bounds = store.priceBounds();
          const normalized = normalizePriceRange(min, max, bounds);

          patchState(store, {
            selectedMinPrice: normalized.min,
            selectedMaxPrice: normalized.max,
            page: 1,
          });
          fetchProducts();
        },

        clearPriceRange: () => {
          patchState(store, {
            selectedMinPrice: null,
            selectedMaxPrice: null,
            page: 1,
          });
          fetchProducts();
        },

        setSortBy: (sortBy: ShopState['sortBy']) => {
          patchState(store, { sortBy, page: 1 });
          fetchProducts();
        },
        setSearchQuery: (searchQuery: string) => {
          patchState(store, { searchQuery, page: 1 });
          fetchPriceBounds();
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
            selectedMinPrice: null,
            selectedMaxPrice: null,
            sortBy: 'featured',
            page: 1,
          });

          fetchPriceBounds();
          fetchProducts();
        },

        openQuickView: (product: ProductCardModel) =>
          patchState(store, { quickViewProduct: product }),
        closeQuickView: () => patchState(store, { quickViewProduct: null }),
      };
    },
  ),
);
