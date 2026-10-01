import { Component, ChangeDetectionStrategy, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLink, faCamera, faStar, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { WardrobeItem } from '../../../../../core/models/iwardrobe';
import { ClothingSymbolComponent } from '../../../../../shared/components/clothing-symbol/clothing-symbol.component';

@Component({
  selector: 'app-wardrobe-item-tile',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ClothingSymbolComponent],
  template: `
    <article
      class="group relative flex flex-col cursor-pointer transition-all duration-300 outline-none select-none"
      (click)="selectItem.emit(item())"
      tabindex="0"
      role="button"
      [attr.aria-label]="item().name"
      (keydown.enter)="selectItem.emit(item())"
      (keydown.space)="$event.preventDefault(); selectItem.emit(item())"
    >
      <!-- Garment Display Plaque -->
      <div
        class="relative w-full aspect-square rounded-2xl overflow-hidden bg-white border border-brand-surface/80 shadow-xs transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-premium group-hover:border-brand-accent/50 group-focus-visible:ring-2 group-focus-visible:ring-brand-accent"
      >
        <!-- Subtle Atelier Source Pill (Top-Start) -->
        <span
          class="absolute top-2.5 start-2.5 z-10 flex h-6 items-center gap-1 px-2 rounded-full bg-white/95 text-brand-primary shadow-xs backdrop-blur-xs text-[10px] font-bold border border-brand-surface/40 transition-transform group-hover:scale-105"
          [title]="sourceLabel()"
        >
          <fa-icon [icon]="sourceIcon()" class="text-[9px] text-brand-accent"></fa-icon>
          <span class="hidden sm:inline text-[9px] uppercase tracking-wider font-semibold text-brand-primary/70">
            {{ sourceShortName() }}
          </span>
        </span>

        <!-- Quick Remove Action (Hover & Focus, Top-End) -->
        <button
          type="button"
          (click)="onRemove($event)"
          class="absolute top-2.5 end-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-brand-primary/45 shadow-xs backdrop-blur-xs transition-all duration-200 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 hover:bg-red-50 hover:text-red-500 hover:scale-110 active:scale-95"
          aria-label="Remove item"
        >
          <fa-icon [icon]="icons.trash" class="text-[10px]"></fa-icon>
        </button>

        <!-- 1. PRODUCT / UPLOAD PRESENTATION -->
        @if (item().source === 'product' || item().source === 'upload') {
          <div class="h-full w-full relative overflow-hidden bg-brand-bg-light">
            <img
              [src]="item().imageUrl || item().productSnapshot?.image || 'assets/images/mock/wardrobe/outfit-1.svg'"
              [alt]="item().name"
              class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
              loading="lazy"
            />
            <!-- Subtle gradient vignette for editorial contrast -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        } @else {
          <!-- 2. HIGH-END ATELIER SYMBOL PRESENTATION -->
          <div
            class="h-full w-full flex flex-col items-center justify-center p-5 relative overflow-hidden transition-transform duration-700 ease-out group-hover:scale-103"
            [style.background]="symbolPlatterGradient()"
          >
            <!-- Delicate grid/watermark texture -->
            <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3d214f_1px,transparent_1px)] [background-size:12px_12px]"></div>

            <!-- Embossed Luxury Garment Medallion -->
            <div
              class="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl shadow-sm border border-black/5 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md"
              [style.backgroundColor]="item().color?.hex || '#ffffff'"
              [style.color]="symbolContrastColor()"
            >
              <app-clothing-symbol [symbol]="item().symbol || 'hanger'" [size]="32"></app-clothing-symbol>
            </div>

            <!-- Tailored Spec Tag -->
            <div class="mt-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/80 backdrop-blur-xs border border-brand-surface/50 shadow-2xs">
              <span
                class="h-2 w-2 rounded-full border border-black/10 shrink-0"
                [style.backgroundColor]="item().color?.hex || '#6e4388'"
              ></span>
              <span class="text-[10px] font-bold text-brand-primary/80 capitalize truncate max-w-[80px]">
                {{ item().color?.name || 'Custom' }}
              </span>
            </div>
          </div>
        }

        <!-- Price Tag (Only for store products) -->
        @if (item().source === 'product' && item().productSnapshot?.price) {
          <div class="absolute bottom-2 start-2 z-10 px-2 py-0.5 rounded-md bg-brand-primary/85 text-white backdrop-blur-xs text-[10px] font-bold tracking-tight shadow-2xs">
            {{ item().productSnapshot!.price | currency : 'EGP' : 'symbol' : '1.0-0' }}
          </div>
        }

        <!-- Color indicator dot for Upload / Store products -->
        @if (item().source !== 'symbol' && item().color?.hex) {
          <span
            class="absolute bottom-2.5 end-2.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm transition-transform group-hover:scale-110"
            [style.backgroundColor]="item().color?.hex"
            [title]="item().color?.name || 'Color'"
          ></span>
        }
      </div>

      <!-- Item Meta Caption -->
      <div class="mt-2.5 px-0.5">
        <h3
          class="line-clamp-1 text-xs sm:text-[13px] font-bold text-brand-primary transition-colors group-hover:text-brand-accent tracking-tight"
          [title]="item().name"
        >
          {{ item().name }}
        </h3>
        <div class="mt-0.5 flex items-center gap-1.5 text-[11px] text-brand-primary/55 font-medium">
          @if (item().size) {
            <span class="uppercase font-semibold tracking-wider text-brand-primary/70">{{ item().size }}</span>
          }
          @if (item().size && (item().color?.name || item().productSnapshot?.categorySlug)) {
            <span>·</span>
          }
          @if (item().color?.name) {
            <span class="truncate">{{ item().color?.name }}</span>
          } @else if (item().productSnapshot?.en?.title) {
            <span class="truncate">{{ item().productSnapshot?.en?.title }}</span>
          }
        </div>
      </div>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeItemTileComponent {
  item = input.required<WardrobeItem>();

  selectItem = output<WardrobeItem>();
  removeItem = output<string>();

  icons = {
    link: faLink,
    camera: faCamera,
    star: faStar,
    trash: faTrashCan,
  };

  sourceIcon = computed(() => {
    switch (this.item().source) {
      case 'product':
        return this.icons.link;
      case 'upload':
        return this.icons.camera;
      case 'symbol':
      default:
        return this.icons.star;
    }
  });

  sourceShortName = computed(() => {
    switch (this.item().source) {
      case 'product':
        return 'Store';
      case 'upload':
        return 'Photo';
      case 'symbol':
      default:
        return 'Symbol';
    }
  });

  sourceLabel = computed(() => {
    switch (this.item().source) {
      case 'product':
        return 'BabyLove Store Item';
      case 'upload':
        return 'Personal Uploaded Garment';
      case 'symbol':
      default:
        return 'Atelier Symbolic Piece';
    }
  });

  symbolPlatterGradient = computed(() => {
    const hex = this.item().color?.hex || '#6e4388';
    return `linear-gradient(135deg, ${hex}14 0%, #fbf9fd 100%)`;
  });

  symbolContrastColor = computed(() => {
    const hex = (this.item().color?.hex || '').toLowerCase();
    if (!hex || hex === '#ffffff' || hex === '#fff' || hex === '#add8e6' || hex === '#faf9f6') {
      return '#3d214f';
    }
    return '#ffffff';
  });

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removeItem.emit(this.item().id);
  }
}
