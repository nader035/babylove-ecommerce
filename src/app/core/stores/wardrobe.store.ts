import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { WardrobeItem } from '../models/iwardrobe';
import { ProductCardModel } from '../services/product.service';
import { WardrobeService } from '../services/wardrobe.service';

export type WardrobeFilter = 'all' | 'product' | 'upload';

export type WardrobeUploadPayload = {
  imageUrl: string;
  title?: string;
  note?: string;
  userId?: string | number;
};

type WardrobeState = {
  items: WardrobeItem[];
  loading: boolean;
  error: string | null;
  selectedFilter: WardrobeFilter;
};

const sortByCreatedAt = (items: WardrobeItem[]): WardrobeItem[] =>
  [...items].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

const upsertItem = (items: WardrobeItem[], item: WardrobeItem): WardrobeItem[] => {
  const exists = items.some((current) => current.id === item.id);
  const nextItems = exists
    ? items.map((current) => (current.id === item.id ? item : current))
    : [item, ...items];

  return sortByCreatedAt(nextItems);
};

const toErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unable to update wardrobe. Please try again.';

export const WardrobeStore = signalStore(
  { providedIn: 'root' },
  withState<WardrobeState>({
    items: [],
    loading: false,
    error: null,
    selectedFilter: 'all',
  }),
  withComputed(({ items, selectedFilter }) => ({
    count: computed(() => items().length),
    uploadedCount: computed(() => items().filter((item) => item.type === 'upload').length),
    productCount: computed(() => items().filter((item) => item.type === 'product').length),
    filteredItems: computed(() => {
      const filter = selectedFilter();

      if (filter === 'all') {
        return items();
      }

      return items().filter((item) => item.type === filter);
    }),
    isEmpty: computed(() => items().length === 0),
    productIds: computed(
      () =>
        new Set(
          items()
            .filter((item) => item.type === 'product' && item.productId !== undefined)
            .map((item) => String(item.productId)),
        ),
    ),
  })),
  withMethods((store, wardrobeService = inject(WardrobeService)) => {
    const loadItems = rxMethod<string | number | undefined>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          wardrobeService.getItems(userId).pipe(
            tapResponse({
              next: (items) =>
                patchState(store, { items: sortByCreatedAt(items), loading: false }),
              error: (error: unknown) =>
                patchState(store, { error: toErrorMessage(error), loading: false }),
            }),
          ),
        ),
      ),
    );

    const addProductItem = rxMethod<{ product: ProductCardModel; userId?: string | number }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ product, userId }) =>
          wardrobeService.addProduct(product, userId).pipe(
            tapResponse({
              next: (item) =>
                patchState(store, {
                  items: upsertItem(store.items(), item),
                  loading: false,
                }),
              error: (error: unknown) =>
                patchState(store, { error: toErrorMessage(error), loading: false }),
            }),
          ),
        ),
      ),
    );

    const addUploadedImage = rxMethod<WardrobeUploadPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          wardrobeService.addMockUploadedImage(payload).pipe(
            tapResponse({
              next: (item) =>
                patchState(store, {
                  items: upsertItem(store.items(), item),
                  loading: false,
                }),
              error: (error: unknown) =>
                patchState(store, { error: toErrorMessage(error), loading: false }),
            }),
          ),
        ),
      ),
    );

    return {
      load(userId?: string | number): void {
        loadItems(userId);
      },

      addProduct(product: ProductCardModel, userId?: string | number): void {
        addProductItem({ product, userId });
      },

      addMockUploadedImage(payload: WardrobeUploadPayload): void {
        addUploadedImage(payload);
      },

      remove(id: string): void {
        const previousItems = store.items();
        patchState(store, {
          items: previousItems.filter((item) => item.id !== id),
          error: null,
        });

        wardrobeService.remove(id).subscribe({
          error: (error: unknown) =>
            patchState(store, { items: previousItems, error: toErrorMessage(error) }),
        });
      },

      update(id: string, changes: Partial<WardrobeItem>): void {
        patchState(store, { loading: true, error: null });

        wardrobeService.update(id, changes).subscribe({
          next: (item) =>
            patchState(store, {
              items: upsertItem(store.items(), item),
              loading: false,
            }),
          error: (error: unknown) =>
            patchState(store, { error: toErrorMessage(error), loading: false }),
        });
      },

      setFilter(filter: WardrobeFilter): void {
        patchState(store, { selectedFilter: filter });
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
