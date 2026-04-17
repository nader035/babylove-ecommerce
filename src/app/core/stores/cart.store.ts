import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ProductCardModel } from '../services/product.service';

export type CartLine = {
  id: number;
  quantity: number;
  product: ProductCardModel;
};

type CartState = {
  items: CartLine[];
};

const CART_STORAGE_KEY = 'babylove_cart';

const readCart = (): CartLine[] => {
  if (typeof localStorage === 'undefined') {
    return [];
  }
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]') as CartLine[];
  } catch {
    return [];
  }
};

const writeCart = (items: CartLine[]) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
};

export const CartStore = signalStore(
  { providedIn: 'root' },
  withState<CartState>({
    items: readCart(),
  }),
  withComputed(({ items }) => ({
    totalItems: computed(() => items().reduce((sum, item) => sum + item.quantity, 0)),
    subtotal: computed(() =>
      items().reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    ),
    shipping: computed(() => (items().length ? 9.99 : 0)),
    total: computed(() => {
      const subtotal = items().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      return subtotal + (items().length ? 9.99 : 0);
    }),
  })),
  withMethods((store) => ({
    addToCart(product: ProductCardModel) {
      const existing = store.items().find((item) => item.product.id === product.id);
      const items = existing
        ? store
            .items()
            .map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            )
        : [...store.items(), { id: Date.now(), quantity: 1, product }];
      patchState(store, { items });
      writeCart(items);
    },
    removeFromCart(productId: number | string) {
      const items = store.items().filter((item) => item.product.id !== productId);
      patchState(store, { items });
      writeCart(items);
    },
    updateQuantity(productId: number | string, quantity: number) {
      const safeQuantity = Math.max(1, quantity);
      const items = store
        .items()
        .map((item) =>
          item.product.id === productId ? { ...item, quantity: safeQuantity } : item,
        );
      patchState(store, { items });
      writeCart(items);
    },
    clearCart() {
      patchState(store, { items: [] });
      writeCart([]);
    },
  })),
);
