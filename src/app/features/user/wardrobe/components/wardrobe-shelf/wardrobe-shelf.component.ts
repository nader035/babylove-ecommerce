import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { WardrobeShelf, WardrobeItem, ClothingType, ClothingSymbol } from '../../../../../core/models/iwardrobe';
import { WardrobeItemTileComponent } from '../wardrobe-item-tile/wardrobe-item-tile.component';
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

@Component({
  selector: 'app-wardrobe-shelf',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    FontAwesomeModule,
    WardrobeItemTileComponent,
    ClothingSymbolComponent,
  ],
  template: `
    <section class="group/shelf flex flex-col w-full mb-12 sm:mb-14">
      <!-- Shelf Frame / Alcove Container -->
      <div class="rounded-3xl bg-white/70 border border-brand-surface/60 p-4 sm:p-6 shadow-2xs backdrop-blur-xs transition-colors hover:border-brand-accent/30">
        <!-- ── Shelf Rail Header ────────────────────────────────────────────── -->
        <div class="flex items-center justify-between mb-5 px-0.5">
          <div class="flex items-center gap-3">
            <!-- Shelf Icon Badge -->
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-bg-light border border-brand-surface/80 text-brand-accent shadow-2xs transition-transform group-hover/shelf:scale-105"
            >
              <app-clothing-symbol [symbol]="shelfIcon()" [size]="20"></app-clothing-symbol>
            </div>

            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-base sm:text-lg font-bold text-brand-primary tracking-tight">
                  {{ 'wardrobe.types.' + shelf().clothingType | transloco }}
                </h2>
                <span
                  class="inline-flex items-center justify-center rounded-full bg-brand-primary/8 px-2.5 py-0.5 text-[11px] font-bold text-brand-primary/70"
                >
                  {{ shelf().items.length }}
                </span>
              </div>
            </div>
          </div>

          <!-- Add Action Header Trigger -->
          <button
            type="button"
            (click)="addToShelf.emit(shelf().clothingType)"
            class="inline-flex items-center gap-1.5 rounded-full border border-brand-surface/80 bg-white px-3.5 py-1.5 text-xs font-bold text-brand-primary/80 shadow-2xs transition-all hover:border-brand-accent/40 hover:bg-brand-primary hover:text-white active:scale-95"
            [attr.aria-label]="'Add to ' + shelf().clothingType"
          >
            <fa-icon [icon]="icons.plus" class="text-[10px] text-brand-accent group-hover:text-white"></fa-icon>
            <span class="text-xs">{{ 'wardrobe.addItem' | transloco }}</span>
          </button>
        </div>

        <!-- ── Shelf Garments Stage ───────────────────────────────────────────
             MOBILE: Natural touch horizontal scroll with snap and peek.
             DESKTOP: Full-width responsive grid that wraps cleanly without scroll.
        ─────────────────────────────────────────────────────────────────────── -->
        <div class="relative w-full">
          <div
            class="flex items-start gap-4 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0
                   md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-5 md:overflow-visible md:pb-2"
          >
            <!-- Render each wardrobe item -->
            @for (item of shelf().items; track item.id) {
              <div class="shrink-0 w-[145px] sm:w-[165px] snap-start md:w-auto md:shrink md:snap-align-none">
                <app-wardrobe-item-tile
                  [item]="item"
                  (selectItem)="selectItem.emit($event)"
                  (removeItem)="removeItem.emit($event)"
                ></app-wardrobe-item-tile>
              </div>
            }

            <!-- Dedicated "+ Add" slot at end of shelf -->
            <div class="shrink-0 w-[145px] sm:w-[165px] snap-start md:w-auto md:shrink md:snap-align-none">
              <button
                type="button"
                (click)="addToShelf.emit(shelf().clothingType)"
                class="group/add flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-brand-surface/90 hover:border-brand-accent bg-brand-bg-light/40 hover:bg-white text-brand-primary/45 hover:text-brand-accent transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
                [title]="'wardrobe.addItem' | transloco"
              >
                <div
                  class="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-2xs group-hover/add:bg-brand-accent/10 transition-colors"
                >
                  <fa-icon [icon]="icons.plus" class="text-xs text-brand-accent"></fa-icon>
                </div>
                <span class="mt-2 text-xs font-bold tracking-tight text-center px-2">
                  {{ 'wardrobe.addItem' | transloco }}
                </span>
              </button>
              <!-- Spacer to align with tile captions -->
              <div class="mt-2.5 h-6"></div>
            </div>
          </div>

          <!-- ── Architectural Shelf Rail Surface ──────────────────────────── -->
          <div class="relative w-full mt-1">
            <!-- Shelf top rail line with subtle luxury metallic sheen -->
            <div class="h-1.5 w-full rounded-t-full bg-gradient-to-r from-brand-surface/50 via-brand-accent/30 to-brand-surface/50"></div>
            <!-- Shelf underside shadow -->
            <div class="h-1 w-full bg-brand-primary/5 rounded-b-full"></div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeShelfComponent {
  shelf = input.required<WardrobeShelf>();

  addToShelf = output<ClothingType>();
  selectItem = output<WardrobeItem>();
  removeItem = output<string>();

  icons = {
    plus: faPlus,
    chevronRight: faChevronRight,
  };

  shelfIcon = computed<ClothingSymbol>(() => {
    return DEFAULT_SYMBOL_FOR_TYPE[this.shelf().clothingType] ?? 'hanger';
  });
}
