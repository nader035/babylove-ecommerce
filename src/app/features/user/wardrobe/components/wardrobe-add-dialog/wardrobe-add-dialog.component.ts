import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  inject,
  computed,
  OnInit,
  DestroyRef,
  HostListener,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faTimes,
  faCloudArrowUp,
  faShoppingBag,
  faStar,
  faSearch,
  faCheck,
  faImage,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

import { WardrobeStore } from '../../../../../core/stores/wardrobe.store';
import { ProductService, ProductCardModel } from '../../../../../core/services/product.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PreferencesStore } from '../../../../../core/stores/preferences.store';
import {
  ClothingType,
  WardrobeItemSource,
  ClothingSymbol,
  CLOTHING_TYPES,
  CLOTHING_SYMBOLS,
} from '../../../../../core/models/iwardrobe';
import { AddWardrobeItemPayload } from '../../../../../core/services/wardrobe.service';
import { ClothingSymbolComponent } from '../../../../../shared/components/clothing-symbol/clothing-symbol.component';

const DEFAULT_SYMBOL_FOR_TYPE: Record<ClothingType, ClothingSymbol> = {
  shirts: 'shirt',
  pants: 'pants',
  dresses: 'dress',
  outerwear: 'jacket',
  knitwear: 'scarf',
  footwear: 'shoe',
  bags: 'bag',
  accessories: 'tie',
  loungewear: 'shirt',
  denim: 'pants',
  other: 'hanger',
};

const MOCK_PREVIEW_IMAGES = [
  'assets/images/mock/wardrobe/outfit-1.svg',
  'assets/images/mock/wardrobe/outfit-2.svg',
];

@Component({
  selector: 'app-wardrobe-add-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    FormsModule,
    FontAwesomeModule,
    ClothingSymbolComponent,
  ],
  template: `
    <!-- Modal Backdrop -->
    <div
      class="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 transition-opacity"
      (click)="closeDialog.emit()"
    ></div>

    <!-- Centered Modal Dialog (Desktop) / Bottom Sheet (Mobile) -->
    <div
      class="fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden
             bottom-0 inset-x-0 max-h-[92vh] rounded-t-3xl
             md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto md:right-auto md:w-full md:max-w-xl md:rounded-3xl md:max-h-[85vh]"
    >
      <!-- Mobile Sheet Drag Handle Indicator -->
      <div class="w-12 h-1 bg-brand-surface rounded-full mx-auto mt-2.5 mb-0.5 md:hidden"></div>

      <!-- Dialog Header -->
      <div class="flex justify-between items-center px-6 py-4 border-b border-brand-surface/60">
        <div class="flex items-center gap-3">
          @if (canGoBack()) {
            <button
              type="button"
              (click)="goBack()"
              class="flex h-8 w-8 items-center justify-center rounded-full text-brand-primary/60 hover:bg-brand-bg-light hover:text-brand-primary transition"
              [attr.aria-label]="'wardrobe.back' | transloco"
            >
              <fa-icon [icon]="icons.arrowLeft" class="text-xs"></fa-icon>
            </button>
          }
          <!-- Step Indicator -->
          <div class="flex items-center gap-1.5 ms-1">
            <span
              class="h-2 w-2 rounded-full transition-all duration-300"
              [class.bg-brand-accent]="step() === 1"
              [class.w-5]="step() === 1"
              [class.bg-brand-surface]="step() !== 1"
            ></span>
            <span
              class="h-2 w-2 rounded-full transition-all duration-300"
              [class.bg-brand-accent]="step() === 2"
              [class.w-5]="step() === 2"
              [class.bg-brand-surface]="step() !== 2"
            ></span>
            <span
              class="h-2 w-2 rounded-full transition-all duration-300"
              [class.bg-brand-accent]="step() === 3"
              [class.w-5]="step() === 3"
              [class.bg-brand-surface]="step() !== 3"
            ></span>
          </div>
        </div>

        <button
          type="button"
          (click)="closeDialog.emit()"
          class="flex h-8 w-8 items-center justify-center rounded-full text-brand-primary/60 hover:bg-brand-bg-light hover:text-brand-primary transition"
          [attr.aria-label]="'wardrobe.close' | transloco"
        >
          <fa-icon [icon]="icons.times" class="text-sm"></fa-icon>
        </button>
      </div>

      <!-- Main Step Body (Scrollable) -->
      <div class="p-6 overflow-y-auto flex-1 min-h-[380px]">
        <!-- ── STEP 1: Select Clothing Type ─────────────────────────────────── -->
        @if (step() === 1) {
          <div class="space-y-5 animate-fade-in">
            <div class="text-center">
              <span class="section-kicker">{{ 'wardrobe.title' | transloco }}</span>
              <h2 class="text-xl font-bold text-brand-primary mt-1">
                {{ 'wardrobe.whatAreYouAdding' | transloco }}
              </h2>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              @for (type of clothingTypes; track type) {
                <button
                  type="button"
                  (click)="selectType(type)"
                  class="group flex flex-col items-center justify-center gap-2.5 p-4 rounded-2xl border border-brand-surface/80 bg-brand-bg-light/50 hover:bg-white hover:border-brand-accent/50 hover:shadow-sm transition-all text-center"
                >
                  <div
                    class="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-accent shadow-2xs group-hover:scale-110 transition-transform"
                  >
                    <app-clothing-symbol [symbol]="getSymbolForType(type)" [size]="22"></app-clothing-symbol>
                  </div>
                  <span class="text-xs font-bold text-brand-primary tracking-tight">
                    {{ 'wardrobe.types.' + type | transloco }}
                  </span>
                </button>
              }
            </div>
          </div>
        }

        <!-- ── STEP 2: Select Item Source ───────────────────────────────────── -->
        @if (step() === 2) {
          <div class="space-y-5 animate-fade-in">
            <div class="text-center">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/5 text-xs font-semibold text-brand-primary mb-2">
                <app-clothing-symbol [symbol]="getSymbolForType(selectedType()!)" [size]="14"></app-clothing-symbol>
                {{ 'wardrobe.types.' + selectedType()! | transloco }}
              </span>
              <h2 class="text-xl font-bold text-brand-primary">
                {{ 'wardrobe.chooseSource' | transloco }}
              </h2>
            </div>

            <div class="flex flex-col gap-3.5 pt-2">
              <!-- Upload Source -->
              <button
                type="button"
                (click)="selectSource('upload')"
                class="group flex items-center gap-4 p-4 rounded-2xl border border-brand-surface/80 bg-white hover:border-brand-accent/50 hover:shadow-sm transition-all text-start"
              >
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-bg-light text-brand-accent group-hover:scale-105 transition-transform">
                  <fa-icon [icon]="icons.upload" class="text-lg"></fa-icon>
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-bold text-brand-primary">
                    {{ 'wardrobe.uploadPhoto' | transloco }}
                  </h3>
                  <p class="text-xs text-brand-primary/55 mt-0.5">
                    {{ 'wardrobe.uploadPhotoDesc' | transloco }}
                  </p>
                </div>
                <span class="text-brand-primary/30 group-hover:text-brand-accent transition-colors">&rarr;</span>
              </button>

              <!-- Store Product Source -->
              <button
                type="button"
                (click)="selectSource('product')"
                class="group flex items-center gap-4 p-4 rounded-2xl border border-brand-surface/80 bg-white hover:border-brand-accent/50 hover:shadow-sm transition-all text-start"
              >
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-bg-light text-brand-accent group-hover:scale-105 transition-transform">
                  <fa-icon [icon]="icons.store" class="text-lg"></fa-icon>
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-bold text-brand-primary">
                    {{ 'wardrobe.fromStore' | transloco }}
                  </h3>
                  <p class="text-xs text-brand-primary/55 mt-0.5">
                    {{ 'wardrobe.fromStoreDesc' | transloco }}
                  </p>
                </div>
                <span class="text-brand-primary/30 group-hover:text-brand-accent transition-colors">&rarr;</span>
              </button>

              <!-- Symbol Source -->
              <button
                type="button"
                (click)="selectSource('symbol')"
                class="group flex items-center gap-4 p-4 rounded-2xl border border-brand-surface/80 bg-white hover:border-brand-accent/50 hover:shadow-sm transition-all text-start"
              >
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-bg-light text-brand-accent group-hover:scale-105 transition-transform">
                  <fa-icon [icon]="icons.star" class="text-lg"></fa-icon>
                </div>
                <div class="flex-1">
                  <h3 class="text-sm font-bold text-brand-primary">
                    {{ 'wardrobe.useSymbol' | transloco }}
                  </h3>
                  <p class="text-xs text-brand-primary/55 mt-0.5">
                    {{ 'wardrobe.useSymbolDesc' | transloco }}
                  </p>
                </div>
                <span class="text-brand-primary/30 group-hover:text-brand-accent transition-colors">&rarr;</span>
              </button>
            </div>
          </div>
        }

        <!-- ── STEP 3: Source Specific Customization ─────────────────────────── -->
        @if (step() === 3) {
          <div class="space-y-6 animate-fade-in">
            <!-- 3a: Upload Branch -->
            @if (selectedSource() === 'upload') {
              <div class="space-y-4">
                <label
                  class="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand-surface bg-brand-bg-light/60 p-4 text-center transition hover:border-brand-accent/60 hover:bg-white"
                >
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onFileSelected($event)"
                  />

                  @if (previewUrl()) {
                    <img
                      [src]="previewUrl()"
                      alt="Upload Preview"
                      class="h-36 w-full rounded-xl object-cover shadow-xs"
                    />
                    <p class="mt-2 text-xs font-semibold text-brand-primary/60">Click to change photo</p>
                  } @else {
                    <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-accent shadow-xs group-hover:scale-105 transition-transform">
                      <fa-icon [icon]="icons.upload" class="text-lg"></fa-icon>
                    </div>
                    <span class="mt-2 text-xs font-bold text-brand-primary">
                      {{ 'wardrobe.uploadPhoto' | transloco }}
                    </span>
                    <span class="text-[11px] text-brand-primary/45">PNG, JPG, WEBP</span>
                  }
                </label>

                <!-- Common Metadata Fields -->
                <ng-container *ngTemplateOutlet="formFieldsTpl"></ng-container>
              </div>
            }

            <!-- 3b: Product Branch -->
            @if (selectedSource() === 'product') {
              <div class="space-y-4">
                @if (!selectedProduct()) {
                  <!-- Search Products Input -->
                  <div class="relative">
                    <fa-icon [icon]="icons.search" class="absolute start-4 top-1/2 -translate-y-1/2 text-brand-primary/40 text-xs"></fa-icon>
                    <input
                      type="text"
                      [value]="searchQuery()"
                      (input)="onSearchChange($any($event.target).value)"
                      class="w-full ps-10 pe-4 py-2.5 rounded-xl border border-brand-surface bg-brand-bg-light text-xs text-brand-primary focus:border-brand-accent focus:bg-white focus:outline-none"
                      [placeholder]="'wardrobe.searchProducts' | transloco"
                    />
                  </div>

                  <!-- Product Cards Grid -->
                  <div class="grid grid-cols-2 gap-3 overflow-y-auto max-h-[280px] p-0.5">
                    @for (product of searchResults(); track product.id) {
                      <div
                        (click)="selectProduct(product)"
                        class="group flex flex-col p-2.5 rounded-xl border border-brand-surface/70 bg-white hover:border-brand-accent hover:shadow-xs transition-all cursor-pointer"
                      >
                        <img
                          [src]="product.image"
                          [alt]="product.en.title"
                          class="w-full aspect-square object-cover rounded-lg bg-brand-bg-light"
                          loading="lazy"
                        />
                        <h4 class="mt-2 line-clamp-1 text-xs font-bold text-brand-primary group-hover:text-brand-accent transition-colors">
                          {{ product.en.title }}
                        </h4>
                        <p class="text-xs font-bold text-brand-accent mt-0.5">
                          {{ product.price | currency : currencyCode() : 'symbol' : '1.0-0' }}
                        </p>
                      </div>
                    }
                  </div>
                } @else {
                  <!-- Selected Product Confirmation Card -->
                  <div class="flex items-center gap-3.5 p-3.5 bg-brand-bg-light rounded-2xl border border-brand-surface relative">
                    <img
                      [src]="selectedProduct()?.image"
                      [alt]="selectedProduct()?.en?.title"
                      class="h-16 w-16 rounded-xl object-cover"
                    />
                    <div class="flex-1">
                      <h4 class="text-xs font-bold text-brand-primary line-clamp-1">
                        {{ selectedProduct()?.en?.title }}
                      </h4>
                      <p class="text-xs font-bold text-brand-accent mt-0.5">
                        {{ selectedProduct()?.price | currency : currencyCode() : 'symbol' : '1.0-0' }}
                      </p>
                    </div>
                    <button
                      type="button"
                      (click)="selectedProduct.set(null)"
                      class="h-7 w-7 rounded-full bg-white text-brand-primary/50 hover:text-red-500 shadow-2xs flex items-center justify-center transition"
                    >
                      <fa-icon [icon]="icons.times" class="text-xs"></fa-icon>
                    </button>
                  </div>

                  <!-- Metadata Fields -->
                  <ng-container *ngTemplateOutlet="formFieldsTpl"></ng-container>
                }
              </div>
            }

            <!-- 3c: Symbol Branch -->
            @if (selectedSource() === 'symbol') {
              <div class="space-y-4">
                <!-- Symbols Grid -->
                <div>
                  <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-2">
                    {{ 'wardrobe.selectSymbol' | transloco }}
                  </label>
                  <div class="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    @for (sym of availableSymbols; track sym) {
                      <button
                        type="button"
                        (click)="selectedSymbol.set(sym)"
                        class="aspect-square rounded-xl flex items-center justify-center border-2 transition-all p-2"
                        [class.border-brand-accent]="selectedSymbol() === sym"
                        [class.bg-brand-accent/10]="selectedSymbol() === sym"
                        [class.text-brand-accent]="selectedSymbol() === sym"
                        [class.border-brand-surface/70]="selectedSymbol() !== sym"
                        [class.bg-brand-bg-light]="selectedSymbol() !== sym"
                        [class.text-brand-primary/60]="selectedSymbol() !== sym"
                      >
                        <app-clothing-symbol [symbol]="sym" [size]="24"></app-clothing-symbol>
                      </button>
                    }
                  </div>
                </div>

                <!-- Metadata Fields -->
                <ng-container *ngTemplateOutlet="formFieldsTpl"></ng-container>
              </div>
            }
          </div>
        }
      </div>

      <!-- Dialog Footer -->
      @if (step() === 3) {
        <div class="p-4 px-6 bg-brand-bg-light border-t border-brand-surface/60 flex items-center justify-end gap-3">
          <button
            type="button"
            (click)="goBack()"
            class="rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-brand-primary/60 hover:text-brand-primary hover:bg-white transition"
          >
            {{ 'wardrobe.back' | transloco }}
          </button>
          <button
            type="button"
            (click)="save()"
            [disabled]="!canSave()"
            class="btn-premium px-7 py-2.5 text-xs font-bold uppercase tracking-wider disabled:opacity-40 disabled:pointer-events-none"
          >
            {{ 'wardrobe.save' | transloco }}
          </button>
        </div>
      }
    </div>

    <!-- ── Reusable Metadata Form Template ───────────────────────────────── -->
    <ng-template #formFieldsTpl>
      <div class="space-y-3.5 pt-2">
        <!-- Item Name -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1">
            {{ 'wardrobe.itemName' | transloco }} *
          </label>
          <input
            type="text"
            [(ngModel)]="formData.name"
            class="w-full text-xs font-semibold text-brand-primary bg-brand-bg-light px-3.5 py-2.5 rounded-xl border border-brand-surface focus:border-brand-accent focus:bg-white focus:outline-none"
            placeholder="e.g. Vintage Silk Blazer"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <!-- Size -->
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1">
              {{ 'wardrobe.itemSize' | transloco }}
            </label>
            <input
              type="text"
              [(ngModel)]="formData.size"
              class="w-full text-xs font-semibold text-brand-primary bg-brand-bg-light px-3.5 py-2.5 rounded-xl border border-brand-surface focus:border-brand-accent focus:bg-white focus:outline-none"
              placeholder="e.g. M, 38, Oversized"
            />
            <div class="flex flex-wrap gap-1 mt-1">
              @for (s of popularSizes; track s) {
                <button
                  type="button"
                  (click)="formData.size = s"
                  class="px-2 py-0.5 rounded text-[10px] font-bold border transition"
                  [class.bg-brand-primary]="formData.size === s"
                  [class.text-white]="formData.size === s"
                  [class.border-brand-surface]="formData.size !== s"
                  [class.text-brand-primary/60]="formData.size !== s"
                >
                  {{ s }}
                </button>
              }
            </div>
          </div>

          <!-- Color Name -->
          <div>
            <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1">
              {{ 'wardrobe.itemColor' | transloco }}
            </label>
            <input
              type="text"
              [(ngModel)]="formData.colorName"
              class="w-full text-xs font-semibold text-brand-primary bg-brand-bg-light px-3.5 py-2.5 rounded-xl border border-brand-surface focus:border-brand-accent focus:bg-white focus:outline-none"
              placeholder="e.g. Sand Beige"
            />
          </div>
        </div>

        <!-- Color Palette Swatch Picker -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1.5">
            {{ 'wardrobe.itemColorHex' | transloco }}
          </label>
          <div class="flex items-center gap-3">
            <input
              type="color"
              [(ngModel)]="formData.colorHex"
              class="h-9 w-9 rounded-lg cursor-pointer border border-brand-surface p-0.5 bg-white shadow-2xs"
            />
            <span class="text-xs font-mono font-semibold text-brand-primary/60">
              {{ formData.colorHex }}
            </span>
            <!-- Preset Color Dots -->
            <div class="flex items-center gap-1.5 ms-auto overflow-x-auto max-w-[200px] py-1">
              @for (c of presetColors; track c.name) {
                <button
                  type="button"
                  (click)="formData.colorHex = c.hex; formData.colorName = c.name"
                  class="h-5 w-5 rounded-full border border-black/15 shadow-2xs transition-transform hover:scale-120 shrink-0"
                  [style.backgroundColor]="c.hex"
                  [title]="c.name"
                ></button>
              }
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1">
            {{ 'wardrobe.itemNotes' | transloco }}
          </label>
          <textarea
            [(ngModel)]="formData.notes"
            rows="2"
            class="w-full text-xs leading-5 text-brand-primary bg-brand-bg-light p-3 rounded-xl border border-brand-surface focus:border-brand-accent focus:bg-white focus:outline-none resize-none"
            placeholder="Style pairing notes or occasions..."
          ></textarea>
        </div>
      </div>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeAddDialogComponent implements OnInit {
  wardrobeStore = inject(WardrobeStore);
  productService = inject(ProductService);
  notificationService = inject(NotificationService);
  preferencesStore = inject(PreferencesStore);
  transloco = inject(TranslocoService);
  destroyRef = inject(DestroyRef);

  preselectedType = input<ClothingType | null>(null);

  closeDialog = output<void>();
  itemAdded = output<void>();

  step = signal<1 | 2 | 3>(1);
  selectedType = signal<ClothingType | null>(null);
  selectedSource = signal<WardrobeItemSource | null>(null);

  clothingTypes: ClothingType[] = CLOTHING_TYPES;
  availableSymbols: ClothingSymbol[] = CLOTHING_SYMBOLS;

  currencyCode = this.preferencesStore.currency;

  icons = {
    arrowLeft: faArrowLeft,
    times: faTimes,
    upload: faCloudArrowUp,
    store: faShoppingBag,
    star: faStar,
    search: faSearch,
    check: faCheck,
    image: faImage,
    plus: faPlus,
  };

  searchQuery = signal('');
  searchResults = signal<ProductCardModel[]>([]);
  searchSubject = new Subject<string>();

  selectedProduct = signal<ProductCardModel | null>(null);
  selectedSymbol = signal<ClothingSymbol>('hanger');
  previewUrl = signal<string | null>(null);
  mockImageCounter = signal(0);

  popularSizes = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
  presetColors = [
    { name: 'Charcoal Noir', hex: '#36454F' },
    { name: 'Off White', hex: '#FAF9F6' },
    { name: 'Deep Obsidian', hex: '#1C1C1E' },
    { name: 'Camel Warm', hex: '#C19A6B' },
    { name: 'Burgundy Wine', hex: '#800020' },
    { name: 'Slate Grey', hex: '#708090' },
    { name: 'Cerulean Mist', hex: '#7BA05B' },
    { name: 'Heather Grey', hex: '#9B9B9B' },
    { name: 'BabyLove Violet', hex: '#6E4388' },
  ];

  formData = {
    name: '',
    size: '',
    colorName: '',
    colorHex: '#3d214f',
    notes: '',
  };

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDialog.emit();
  }

  ngOnInit(): void {
    const pre = this.preselectedType();
    if (pre) {
      this.selectedType.set(pre);
      this.selectedSymbol.set(this.getSymbolForType(pre));
      this.step.set(2);
    }

    // Live debounced product search
    this.searchSubject
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query.trim()) {
            return this.productService.getProducts({ pageSize: 6 });
          }
          return this.productService.searchProducts(query, 8).pipe(catchError(() => of([])));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searchResults.set(results);
      });

    // Populate initial products for store picker
    this.productService.getProducts({ pageSize: 6 }).subscribe((items) => {
      if (this.searchResults().length === 0) {
        this.searchResults.set(items);
      }
    });
  }

  canGoBack(): boolean {
    if (this.step() === 3) return true;
    if (this.step() === 2 && !this.preselectedType()) return true;
    return false;
  }

  goBack(): void {
    if (this.step() === 3) {
      this.step.set(2);
    } else if (this.step() === 2) {
      if (this.preselectedType()) {
        this.closeDialog.emit();
      } else {
        this.step.set(1);
      }
    }
  }

  getSymbolForType(type: ClothingType): ClothingSymbol {
    return DEFAULT_SYMBOL_FOR_TYPE[type] ?? 'hanger';
  }

  selectType(type: ClothingType): void {
    this.selectedType.set(type);
    this.selectedSymbol.set(this.getSymbolForType(type));
    this.step.set(2);
  }

  selectSource(source: WardrobeItemSource): void {
    this.selectedSource.set(source);
    this.step.set(3);

    // Initial setup
    this.formData.name = '';
    this.selectedProduct.set(null);
    this.previewUrl.set(null);
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  selectProduct(product: ProductCardModel): void {
    this.selectedProduct.set(product);
    this.formData.name = product.en.title;
    this.formData.colorName = 'Original';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      input.value = '';
      this.notificationService.warning(this.transloco.translate('wardrobe.invalidImage'));
      return;
    }

    // Set local preview blob
    this.previewUrl.set(URL.createObjectURL(file));
    if (!this.formData.name) {
      this.formData.name = file.name.replace(/\.[^/.]+$/, '');
    }
  }

  canSave(): boolean {
    if (!this.formData.name.trim()) return false;
    const source = this.selectedSource();
    if (source === 'product' && !this.selectedProduct()) return false;
    return true;
  }

  save(): void {
    if (!this.canSave()) return;

    const source = this.selectedSource()!;
    const clothingType = this.selectedType()!;

    let imageUrl: string | undefined;
    let productId: string | number | undefined;
    let productSnapshot: AddWardrobeItemPayload['productSnapshot'];
    let symbol: ClothingSymbol | undefined;

    if (source === 'product') {
      const prod = this.selectedProduct()!;
      productId = prod.id;
      imageUrl = prod.image;
      productSnapshot = {
        slug: prod.slug,
        price: prod.price,
        categorySlug: prod.categorySlug,
        image: prod.image,
        en: { title: prod.en.title },
        ar: { title: prod.ar.title },
      };
    } else if (source === 'upload') {
      const nextMock = MOCK_PREVIEW_IMAGES[this.mockImageCounter() % MOCK_PREVIEW_IMAGES.length];
      this.mockImageCounter.update((c) => c + 1);
      imageUrl = this.previewUrl() || nextMock;
    } else if (source === 'symbol') {
      symbol = this.selectedSymbol();
    }

    const payload: AddWardrobeItemPayload = {
      clothingType,
      source,
      name: this.formData.name.trim(),
      color: {
        name: this.formData.colorName.trim() || 'Custom',
        hex: this.formData.colorHex,
      },
      size: this.formData.size.trim() || undefined,
      notes: this.formData.notes.trim() || undefined,
      imageUrl,
      productId,
      productSnapshot,
      symbol,
    };

    this.wardrobeStore.addItem(payload);
    this.notificationService.success(this.transloco.translate('wardrobe.savedSuccessfully'));
    this.itemAdded.emit();
    this.closeDialog.emit();
  }
}
