import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

export type BodyZone = 'head' | 'torso' | 'arms' | 'legs' | 'feet';

export interface BodyZoneConfig {
  id: BodyZone;
  labelKey: string;
  ariaLabelKey: string;
  taglineKey: string;
  types: string[];
  category?: string;
  numberPrefix: string;
}

export const BODY_ZONES: BodyZoneConfig[] = [
  {
    id: 'head',
    labelKey: 'home.discover.zone.head',
    ariaLabelKey: 'home.discover.zone.head',
    taglineKey: 'home.discover.taglines.head',
    types: ['jewelry'],
    category: 'accessories',
    numberPrefix: '01',
  },
  {
    id: 'torso',
    labelKey: 'home.discover.zone.torso',
    ariaLabelKey: 'home.discover.zone.torso',
    taglineKey: 'home.discover.taglines.torso',
    types: ['knitwear', 'shirts', 'outerwear', 'basics', 'essentials'],
    numberPrefix: '02',
  },
  {
    id: 'arms',
    labelKey: 'home.discover.zone.arms',
    ariaLabelKey: 'home.discover.zone.arms',
    taglineKey: 'home.discover.taglines.arms',
    types: ['bags'],
    category: 'accessories',
    numberPrefix: '03',
  },
  {
    id: 'legs',
    labelKey: 'home.discover.zone.legs',
    ariaLabelKey: 'home.discover.zone.legs',
    taglineKey: 'home.discover.taglines.legs',
    types: ['separates', 'denim', 'dresses', 'lounge'],
    numberPrefix: '04',
  },
  {
    id: 'feet',
    labelKey: 'home.discover.zone.feet',
    ariaLabelKey: 'home.discover.zone.feet',
    taglineKey: 'home.discover.taglines.feet',
    types: ['footwear'],
    numberPrefix: '05',
  },
];

type ExplorationState = {
  explored: Record<string, number>;
};

const STORAGE_KEY = 'babylove_exploration';

const readExploration = (): Record<string, number> => {
  if (typeof localStorage === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Record<string, number>;
  } catch {
    return {};
  }
};

const writeExploration = (explored: Record<string, number>): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(explored));
  }
};

export const ExplorationStore = signalStore(
  { providedIn: 'root' },
  withState<ExplorationState>({
    explored: readExploration(),
  }),
  withComputed(({ explored }) => ({
    exploredZones: computed(() => new Set(
      Object.entries(explored())
        .filter(([, count]) => count > 0)
        .map(([zone]) => zone),
    )),
    exploredCount: computed(() =>
      Object.values(explored()).filter((count) => count > 0).length,
    ),
    zoneIntensity: computed(() => {
      const exp = explored();
      return Object.fromEntries(
        BODY_ZONES.map((z) => [z.id, Math.min(1, (exp[z.id] || 0) / 5)]),
      ) as Record<BodyZone, number>;
    }),
  })),
  withMethods((store) => ({
    markExplored(zone: BodyZone): void {
      const current = store.explored();
      const next = { ...current, [zone]: (current[zone] || 0) + 1 };
      patchState(store, { explored: next });
      writeExploration(next);
    },
    getZoneForType(typeKey: string): BodyZone | null {
      const normalized = typeKey.toLowerCase();
      const match = BODY_ZONES.find((z) => z.types.includes(normalized));
      return match?.id ?? null;
    },
    reset(): void {
      patchState(store, { explored: {} });
      writeExploration({});
    },
  })),
);
