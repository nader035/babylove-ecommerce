import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProductCardModel } from '../services/product.service';

type WishlistState = {
  items: ProductCardModel[];
};

const STORAGE_KEY = 'babylove_wishlist';

const readWishlist = (): ProductCardModel[] => {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as ProductCardModel[];
  } catch {
    return [];
  }
};

const writeWishlist = (items: ProductCardModel[]) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
};

export const WishlistStore = signalStore(
  { providedIn: 'root' },
  withState<WishlistState>({
    items: readWishlist(),
  }),
  withComputed(({ items }) => ({
    count: computed(() => items().length),
    ids: computed(() => new Set(items().map((item) => item.id))),
  })),
  withMethods((store) => ({
    toggle(product: ProductCardModel) {
      const exists = store.items().some((item) => item.id === product.id);
      const items = exists
        ? store.items().filter((item) => item.id !== product.id)
        : [...store.items(), product];
      patchState(store, { items });
      writeWishlist(items);
    },
    remove(productId: number | string) {
      const items = store.items().filter((item) => item.id !== productId);
      patchState(store, { items });
      writeWishlist(items);
    },
  })),
);
