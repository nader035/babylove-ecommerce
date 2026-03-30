import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

type PreferencesState = {
  language: 'en' | 'ar';
  currency: 'USD' | 'EGP';
};

const STORAGE_KEY = 'babylove_preferences';

const readPreferences = (): PreferencesState => {
  if (typeof localStorage === 'undefined') {
    return { language: 'en', currency: 'USD' };
  }
  try {
    return {
      language: 'en',
      currency: 'USD',
      ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<PreferencesState>),
    };
  } catch {
    return { language: 'en', currency: 'USD' };
  }
};

const writePreferences = (state: PreferencesState) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

export const PreferencesStore = signalStore(
  { providedIn: 'root' },
  withState<PreferencesState>(readPreferences()),
  withComputed(({ language, currency }) => ({
    isRTL: computed(() => language() === 'ar'),
    locale: computed(() => (language() === 'ar' ? 'ar-EG' : 'en-US')),
    currencyLabel: computed(() => currency()),
  })),
  withMethods((store) => ({
    setLanguage(language: 'en' | 'ar') {
      patchState(store, { language });
      writePreferences({
        language: store.language(),
        currency: store.currency(),
      });
    },
    setCurrency(currency: 'USD' | 'EGP') {
      patchState(store, { currency });
      writePreferences({
        language: store.language(),
        currency: store.currency(),
      });
    },
  })),
);
