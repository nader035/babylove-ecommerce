import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  signal,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faPen,
  faCheck,
  faTimes,
  faTrashCan,
  faLink,
  faCamera,
  faStar,
  faArrowUpRightFromSquare,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { WardrobeItem } from '../../../../../core/models/iwardrobe';
import { ClothingSymbolComponent } from '../../../../../shared/components/clothing-symbol/clothing-symbol.component';

const POPULAR_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'One Size'];
const PRESET_COLORS = [
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

@Component({
  selector: 'app-wardrobe-item-detail',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    RouterLink,
    FormsModule,
    FontAwesomeModule,
    ClothingSymbolComponent,
  ],
  template: `
    <!-- Backdrop Overlay -->
    <div
      class="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 transition-opacity"
      (click)="close.emit()"
    ></div>

    <!-- Slide-over Drawer Panel -->
    <aside
      @drawerSlide
      class="fixed z-50 flex flex-col bg-white shadow-2xl overflow-hidden
             bottom-0 inset-x-0 max-h-[92vh] rounded-t-3xl
             md:top-0 md:bottom-0 md:end-0 md:start-auto md:w-full md:max-w-md md:rounded-none md:max-h-full"
    >
      <!-- Mobile Sheet Drag Handle Indicator -->
      <div class="w-12 h-1 bg-brand-surface rounded-full mx-auto mt-2.5 mb-0.5 md:hidden"></div>

      <!-- Top Action Bar -->
      <div class="sticky top-0 z-10 flex justify-between items-center px-6 py-4 bg-white/95 backdrop-blur-xs border-b border-brand-surface/60">
        <button
          type="button"
          (click)="toggleEdit()"
          class="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition active:scale-95"
          [class.bg-brand-primary]="isEditing()"
          [class.text-white]="isEditing()"
          [class.text-brand-primary]="!isEditing()"
          [class.hover:bg-brand-bg-light]="!isEditing()"
        >
          <fa-icon [icon]="isEditing() ? icons.check : icons.pen" class="text-xs"></fa-icon>
          <span>{{ (isEditing() ? 'wardrobe.done' : 'wardrobe.edit') | transloco }}</span>
        </button>

        <button
          type="button"
          (click)="close.emit()"
          class="flex h-9 w-9 items-center justify-center rounded-full text-brand-primary/60 hover:bg-brand-bg-light hover:text-brand-primary transition"
          [attr.aria-label]="'wardrobe.close' | transloco"
        >
          <fa-icon [icon]="icons.times" class="text-sm"></fa-icon>
        </button>
      </div>

      <!-- Scrollable Main Content -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
        <!-- Visual Display Plaque -->
        <div class="w-full aspect-square rounded-2xl overflow-hidden bg-brand-bg-light border border-brand-surface/80 relative shadow-xs">
          @if (item().source === 'product' || item().source === 'upload') {
            <img
              [src]="item().imageUrl || item().productSnapshot?.image || 'assets/images/mock/wardrobe/outfit-1.svg'"
              [alt]="item().name"
              class="w-full h-full object-cover"
            />
          } @else {
            <div
              class="w-full h-full flex flex-col items-center justify-center p-8 relative overflow-hidden"
              [style.background]="symbolBgStyle()"
            >
              <div class="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3d214f_1px,transparent_1px)] [background-size:12px_12px]"></div>

              <div
                class="flex h-28 w-28 items-center justify-center rounded-3xl shadow-md border border-black/5 text-white transition-transform hover:scale-105"
                [style.backgroundColor]="editColorHex || item().color?.hex || '#6e4388'"
                [style.color]="symbolContrastColor()"
              >
                <app-clothing-symbol [symbol]="item().symbol || 'hanger'" [size]="52"></app-clothing-symbol>
              </div>

              <div class="mt-4 px-3 py-1 rounded-full bg-white/85 backdrop-blur-xs border border-brand-surface/60 shadow-2xs">
                <span class="text-xs font-bold text-brand-primary/80 capitalize">
                  {{ editColorName || item().color?.name || 'Custom Symbol' }}
                </span>
              </div>
            </div>
          }
        </div>

        <!-- Meta and Information -->
        <div class="flex flex-col gap-4">
          <!-- Item Name -->
          <div>
            @if (isEditing()) {
              <label class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1.5">
                {{ 'wardrobe.itemName' | transloco }}
              </label>
              <input
                type="text"
                [(ngModel)]="editName"
                class="w-full text-lg font-bold text-brand-primary bg-brand-bg-light px-4 py-2.5 rounded-xl border border-brand-surface focus:border-brand-accent focus:bg-white focus:outline-none"
              />
            } @else {
              <h2 class="text-2xl font-bold text-brand-primary tracking-tight">{{ item().name }}</h2>
            }
          </div>

          <!-- Source Reference & Store Link -->
          <div class="flex items-center gap-2 text-xs">
            @if (item().source === 'product') {
              @if (productSlug(); as slug) {
                <a
                  [routerLink]="['/product', slug]"
                  (click)="close.emit()"
                  class="inline-flex items-center gap-1.5 font-bold text-brand-accent hover:underline bg-brand-accent/8 px-2.5 py-1 rounded-full"
                >
                  <fa-icon [icon]="icons.link" class="text-[10px]"></fa-icon>
                  <span>{{ 'wardrobe.fromBabyLove' | transloco }}</span>
                  <fa-icon [icon]="icons.external" class="text-[9px]"></fa-icon>
                </a>
              } @else {
                <span class="inline-flex items-center gap-1.5 text-brand-primary/60 font-medium">
                  <fa-icon [icon]="icons.link" class="text-[10px]"></fa-icon>
                  <span>{{ 'wardrobe.fromBabyLove' | transloco }}</span>
                </span>
              }
            } @else if (item().source === 'upload') {
              <span class="inline-flex items-center gap-1.5 text-brand-primary/70 font-semibold bg-brand-primary/5 px-2.5 py-1 rounded-full">
                <fa-icon [icon]="icons.camera" class="text-[10px]"></fa-icon>
                <span>{{ 'wardrobe.yourUpload' | transloco }}</span>
              </span>
            } @else {
              <span class="inline-flex items-center gap-1.5 text-brand-primary/70 font-semibold bg-brand-primary/5 px-2.5 py-1 rounded-full">
                <fa-icon [icon]="icons.star" class="text-[10px] text-brand-accent"></fa-icon>
                <span>{{ 'wardrobe.customItem' | transloco }}</span>
              </span>
            }
          </div>

          <hr class="border-brand-surface/50 my-1" />

          <!-- Attributes Grid -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Clothing Type -->
            <div>
              <span class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1">
                {{ 'wardrobe.source' | transloco }}
              </span>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-primary/5 text-brand-primary capitalize">
                {{ 'wardrobe.types.' + item().clothingType | transloco }}
              </span>
            </div>

            <!-- Size -->
            <div>
              <span class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1">
                {{ 'wardrobe.itemSize' | transloco }}
              </span>
              @if (isEditing()) {
                <div class="space-y-1.5">
                  <input
                    type="text"
                    [(ngModel)]="editSize"
                    placeholder="e.g. M"
                    class="text-xs font-semibold text-brand-primary bg-brand-bg-light px-3 py-1.5 rounded-lg border border-brand-surface focus:border-brand-accent focus:outline-none w-full"
                  />
                  <!-- Size shortcuts -->
                  <div class="flex flex-wrap gap-1">
                    @for (s of popularSizes; track s) {
                      <button
                        type="button"
                        (click)="editSize = s"
                        class="px-2 py-0.5 rounded text-[10px] font-bold border transition"
                        [class.bg-brand-primary]="editSize === s"
                        [class.text-white]="editSize === s"
                        [class.border-brand-surface]="editSize !== s"
                        [class.text-brand-primary/60]="editSize !== s"
                      >
                        {{ s }}
                      </button>
                    }
                  </div>
                </div>
              } @else {
                <span class="text-sm font-semibold text-brand-primary">{{ item().size || '—' }}</span>
              }
            </div>

            <!-- Color -->
            <div class="col-span-2">
              <span class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1.5">
                {{ 'wardrobe.itemColor' | transloco }}
              </span>
              @if (isEditing()) {
                <div class="space-y-2">
                  <div class="flex items-center gap-3">
                    <input
                      type="color"
                      [(ngModel)]="editColorHex"
                      class="h-9 w-9 rounded-lg cursor-pointer border border-brand-surface p-0.5 bg-white shadow-2xs"
                    />
                    <input
                      type="text"
                      [(ngModel)]="editColorName"
                      placeholder="Color Name (e.g. Sand Beige)"
                      class="text-xs font-semibold text-brand-primary bg-brand-bg-light px-3 py-2 rounded-lg border border-brand-surface focus:border-brand-accent focus:outline-none flex-1"
                    />
                  </div>
                  <!-- Quick preset color swatches -->
                  <div class="flex flex-wrap items-center gap-1.5 pt-1">
                    @for (c of presetColors; track c.name) {
                      <button
                        type="button"
                        (click)="editColorHex = c.hex; editColorName = c.name"
                        class="h-5 w-5 rounded-full border border-black/15 shadow-2xs transition-transform hover:scale-120"
                        [style.backgroundColor]="c.hex"
                        [title]="c.name"
                      ></button>
                    }
                  </div>
                </div>
              } @else {
                <div class="flex items-center gap-2.5">
                  <span
                    class="h-4.5 w-4.5 rounded-full border border-black/15 shadow-xs"
                    [style.backgroundColor]="item().color?.hex || '#ffffff'"
                  ></span>
                  <span class="text-sm font-semibold text-brand-primary capitalize">
                    {{ item().color?.name || '—' }}
                  </span>
                  @if (item().color?.hex) {
                    <span class="text-xs font-mono text-brand-primary/40">{{ item().color?.hex }}</span>
                  }
                </div>
              }
            </div>

            <!-- Notes -->
            <div class="col-span-2">
              <span class="block text-[11px] font-bold uppercase tracking-wider text-brand-primary/45 mb-1.5">
                {{ 'wardrobe.itemNotes' | transloco }}
              </span>
              @if (isEditing()) {
                <textarea
                  [(ngModel)]="editNotes"
                  rows="3"
                  class="w-full text-xs leading-5 text-brand-primary bg-brand-bg-light p-3 rounded-xl border border-brand-surface focus:border-brand-accent focus:bg-white focus:outline-none resize-none"
                  placeholder="Styling notes, pairing ideas, or season..."
                ></textarea>
              } @else {
                <p class="text-xs leading-5 text-brand-primary/75 bg-brand-bg-light/70 p-3 rounded-xl border border-brand-surface/40">
                  {{ item().notes || 'No styling notes recorded for this piece.' }}
                </p>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- ── Footer Actions with Safe Inline Delete Confirmation ───────────── -->
      <div class="p-5 bg-brand-bg-light border-t border-brand-surface/60">
        @if (!showDeleteConfirm()) {
          <div class="flex items-center justify-between">
            @if (item().source === 'product' && productSlug(); as slug) {
              <a
                [routerLink]="['/product', slug]"
                (click)="close.emit()"
                class="text-xs font-bold uppercase tracking-wider text-brand-accent hover:underline flex items-center gap-1.5"
              >
                <span>{{ 'wardrobe.viewInStore' | transloco }}</span>
                <fa-icon [icon]="icons.external" class="text-[10px]"></fa-icon>
              </a>
            } @else {
              <div></div>
            }

            <button
              type="button"
              (click)="showDeleteConfirm.set(true)"
              class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition"
            >
              <fa-icon [icon]="icons.trash" class="text-xs"></fa-icon>
              <span>{{ 'wardrobe.remove' | transloco }}</span>
            </button>
          </div>
        } @else {
          <!-- Inline Safe Confirmation Box -->
          <div class="flex flex-col gap-2.5 p-3 rounded-xl bg-red-50/80 border border-red-200">
            <p class="text-xs font-bold text-red-800 text-center">
              {{ 'wardrobe.removeConfirm' | transloco }}
            </p>
            <div class="flex items-center justify-center gap-3">
              <button
                type="button"
                (click)="showDeleteConfirm.set(false)"
                class="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-brand-primary border border-brand-surface hover:bg-brand-bg-light transition"
              >
                {{ 'common.cancel' | transloco }}
              </button>
              <button
                type="button"
                (click)="onConfirmRemove()"
                class="px-4 py-1.5 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition shadow-2xs"
              >
                {{ 'wardrobe.remove' | transloco }}
              </button>
            </div>
          </div>
        }
      </div>
    </aside>
  `,
  animations: [
    trigger('drawerSlide', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0)' })),
      ]),
      transition(':leave', [
        animate('250ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeItemDetailComponent {
  item = input.required<WardrobeItem>();

  close = output<void>();
  update = output<{ id: string; changes: Partial<WardrobeItem> }>();
  remove = output<string>();

  isEditing = signal(false);
  showDeleteConfirm = signal(false);

  editName = '';
  editSize = '';
  editColorName = '';
  editColorHex = '#3d214f';
  editNotes = '';

  popularSizes = POPULAR_SIZES;
  presetColors = PRESET_COLORS;

  icons = {
    pen: faPen,
    check: faCheck,
    times: faTimes,
    trash: faTrashCan,
    link: faLink,
    camera: faCamera,
    star: faStar,
    external: faArrowUpRightFromSquare,
    warning: faExclamationTriangle,
  };

  productSlug = signal<string | null>(null);

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  constructor() {
    effect(() => {
      const it = this.item();
      this.editName = it.name;
      this.editSize = it.size || '';
      this.editColorName = it.color?.name || '';
      this.editColorHex = it.color?.hex || '#3d214f';
      this.editNotes = it.notes || '';
      this.productSlug.set(it.productSnapshot?.slug || null);
      this.showDeleteConfirm.set(false);
    });
  }

  symbolBgStyle(): string {
    const hex = this.editColorHex || this.item().color?.hex || '#6e4388';
    return `linear-gradient(135deg, ${hex}15 0%, #faf8fc 100%)`;
  }

  symbolContrastColor(): string {
    const hex = (this.editColorHex || this.item().color?.hex || '').toLowerCase();
    if (!hex || hex === '#ffffff' || hex === '#fff' || hex === '#add8e6' || hex === '#faf9f6') {
      return '#3d214f';
    }
    return '#ffffff';
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.update.emit({
        id: this.item().id,
        changes: {
          name: this.editName.trim() || this.item().name,
          size: this.editSize.trim() || undefined,
          color: {
            name: this.editColorName.trim() || 'Custom',
            hex: this.editColorHex,
          },
          notes: this.editNotes.trim() || undefined,
        },
      });
      this.isEditing.set(false);
    } else {
      this.isEditing.set(true);
    }
  }

  onConfirmRemove(): void {
    this.remove.emit(this.item().id);
    this.close.emit();
  }
}
