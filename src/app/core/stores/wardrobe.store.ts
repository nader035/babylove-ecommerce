import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import {
  ClothingType,
  WardrobeItem,
  WardrobeShelf,
  productTypeToClothingType,
  createProductSnapshot,
} from '../models/iwardrobe';
import { ProductCardModel } from '../services/product.service';
import { AddWardrobeItemPayload, WardrobeService } from '../services/wardrobe.service';

type WardrobeState = {
  items: WardrobeItem[];
  loading: boolean;
  error: string | null;
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

// Shelf display order: outerwear → shirts → knitwear → dresses → pants → denim → loungewear → footwear → bags → accessories → other
const SHELF_ORDER: ClothingType[] = [
  'outerwear', 'shirts', 'knitwear', 'dresses', 'pants',
  'denim', 'loungewear', 'footwear', 'bags', 'accessories', 'other',
];

export const WardrobeStore = signalStore(
  { providedIn: 'root' },
  withState<WardrobeState>({
    items: [],
    loading: false,
    error: null,
  }),
  withComputed(({ items }) => ({
    count: computed(() => items().length),
    isEmpty: computed(() => items().length === 0),

    /** Auto-grouped shelves from items' clothingType — the core wardrobe metaphor */
    shelves: computed((): WardrobeShelf[] => {
      const grouped = new Map<ClothingType, WardrobeItem[]>();
      for (const item of items()) {
        const list = grouped.get(item.clothingType) ?? [];
        list.push(item);
        grouped.set(item.clothingType, list);
      }
      return Array.from(grouped.entries())
        .map(([clothingType, shelfItems]) => ({
          clothingType,
          items: sortByCreatedAt(shelfItems),
        }))
        .sort((a, b) => {
          const aIdx = SHELF_ORDER.indexOf(a.clothingType);
          const bIdx = SHELF_ORDER.indexOf(b.clothingType);
          return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
        });
    }),

    shelfCount: computed(() => {
      const types = new Set(items().map((item) => item.clothingType));
      return types.size;
    }),

    productIds: computed(
      () =>
        new Set(
          items()
            .filter((item) => item.source === 'product' && item.productId != null)
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

    const addItemRx = rxMethod<AddWardrobeItemPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((payload) =>
          wardrobeService.addItem(payload).pipe(
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

    const addFromProductRx = rxMethod<{ product: ProductCardModel; userId?: string | number }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ product, userId }) =>
          wardrobeService.addFromProduct(product, userId).pipe(
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

      addItem(payload: AddWardrobeItemPayload): void {
        addItemRx(payload);
      },

      addProduct(product: ProductCardModel, userId?: string | number): void {
        addFromProductRx({ product, userId });
      },

      updateItem(id: string, changes: Partial<WardrobeItem>): void {
        // Optimistic update
        const previousItems = store.items();
        patchState(store, {
          items: previousItems.map((item) =>
            item.id === id ? { ...item, ...changes, updatedAt: new Date().toISOString() } : item,
          ),
          error: null,
        });

        wardrobeService.updateItem(id, changes).subscribe({
          next: (updated) =>
            patchState(store, { items: upsertItem(store.items(), updated) }),
          error: (error: unknown) =>
            patchState(store, { items: previousItems, error: toErrorMessage(error) }),
        });
      },

      removeItem(id: string): void {
        // Optimistic remove
        const previousItems = store.items();
        patchState(store, {
          items: previousItems.filter((item) => item.id !== id),
          error: null,
        });

        wardrobeService.removeItem(id).subscribe({
          error: (error: unknown) =>
            patchState(store, { items: previousItems, error: toErrorMessage(error) }),
        });
      },

      clearError(): void {
        patchState(store, { error: null });
      },
    };
  }),
);
