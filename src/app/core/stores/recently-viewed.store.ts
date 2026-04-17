import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProductCardModel } from '../services/product.service';

export type RecentlyViewedEntry = {
  product: ProductCardModel;
  viewedAt: number;
};

type RecentlyViewedState = {
  entries: RecentlyViewedEntry[];
};

const STORAGE_KEY = 'babylove_recently_viewed';
const MAX_ENTRIES = 20;

const toIdKey = (id: ProductCardModel['id']): string => String(id);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isLocalizedProductText = (
  value: unknown,
): value is { title: string; shortDescription: string } =>
  isRecord(value) &&
  typeof value['title'] === 'string' &&
  typeof value['shortDescription'] === 'string';

const isCategoryTitle = (value: unknown): value is { en: string; ar: string } =>
  isRecord(value) && typeof value['en'] === 'string' && typeof value['ar'] === 'string';

const isProductCardModel = (value: unknown): value is ProductCardModel =>
  isRecord(value) &&
  (typeof value['id'] === 'number' || typeof value['id'] === 'string') &&
  typeof value['slug'] === 'string' &&
  typeof value['image'] === 'string' &&
  typeof value['categorySlug'] === 'string' &&
  isCategoryTitle(value['categoryTitle']) &&
  typeof value['price'] === 'number' &&
  typeof value['rating'] === 'number' &&
  typeof value['reviewCount'] === 'number' &&
  typeof value['type'] === 'string' &&
  isLocalizedProductText(value['en']) &&
  isLocalizedProductText(value['ar']);

const isRecentlyViewedEntry = (value: unknown): value is RecentlyViewedEntry =>
  isRecord(value) &&
  typeof value['viewedAt'] === 'number' &&
  Number.isFinite(value['viewedAt']) &&
  isProductCardModel(value['product']);

const normalizeEntries = (entries: RecentlyViewedEntry[]): RecentlyViewedEntry[] => {
  const seen = new Set<string>();

  return entries
    .filter((entry) => Number.isFinite(entry.viewedAt))
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .filter((entry) => {
      const idKey = toIdKey(entry.product.id);
      if (seen.has(idKey)) {
        return false;
      }
      seen.add(idKey);
      return true;
    })
    .slice(0, MAX_ENTRIES);
};

const readRecentlyViewed = (): RecentlyViewedEntry[] => {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeEntries(parsed.filter(isRecentlyViewedEntry));
  } catch {
    return [];
  }
};

const writeRecentlyViewed = (entries: RecentlyViewedEntry[]): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const RecentlyViewedStore = signalStore(
  { providedIn: 'root' },
  withState<RecentlyViewedState>({
    entries: readRecentlyViewed(),
  }),
  withComputed(({ entries }) => ({
    count: computed(() => entries().length),
    items: computed(() => entries().map((entry) => entry.product)),
    ids: computed(() => new Set(entries().map((entry) => toIdKey(entry.product.id)))),
  })),
  withMethods((store) => ({
    track(product: ProductCardModel) {
      const nextEntries = normalizeEntries([
        {
          product,
          viewedAt: Date.now(),
        },
        ...store.entries(),
      ]);

      patchState(store, { entries: nextEntries });
      writeRecentlyViewed(nextEntries);
    },

    remove(productId: ProductCardModel['id']) {
      const idKey = toIdKey(productId);
      const nextEntries = store.entries().filter((entry) => toIdKey(entry.product.id) !== idKey);
      patchState(store, { entries: nextEntries });
      writeRecentlyViewed(nextEntries);
    },

    clear() {
      patchState(store, { entries: [] });
      writeRecentlyViewed([]);
    },
  })),
);
