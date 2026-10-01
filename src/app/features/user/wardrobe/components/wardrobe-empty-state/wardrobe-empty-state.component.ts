import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-wardrobe-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule],
  template: `
    <div class="flex flex-col items-center justify-center py-20 px-6 text-center max-w-xl mx-auto">
      <!-- Architectural Empty Wardrobe Metaphor -->
      <div class="relative mb-10 w-44 h-44 flex items-center justify-center">
        <!-- Minimalist Shadowed Shelving Silhouette -->
        <div class="absolute inset-0 flex flex-col justify-between py-6 opacity-60">
          <div class="w-full h-1 bg-brand-surface rounded-full shadow-2xs"></div>
          <div class="w-full h-1 bg-brand-surface rounded-full shadow-2xs"></div>
          <div class="w-full h-1 bg-brand-surface rounded-full shadow-2xs"></div>
        </div>

        <!-- Hanging Talisman / Gently Swinging Hanger -->
        <div
          class="relative z-10 hanger-swing flex h-24 w-24 items-center justify-center rounded-3xl bg-white shadow-premium border border-brand-surface/80 text-brand-accent"
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M14 6a2 2 0 1 0 -4 0c0 1.667 .67 3 2 4h0c1.33 -1 2 -2.333 2 -4z"/>
            <path d="M12 10l-8 6h16z"/>
            <path d="M4 16v2h16v-2"/>
          </svg>
        </div>
      </div>

      <!-- Editorial Typography -->
      <span class="section-kicker">{{ 'wardrobe.title' | transloco }}</span>
      <h2 class="mt-2 text-2xl sm:text-3xl font-bold text-brand-primary">
        {{ 'wardrobe.emptyTitle' | transloco }}
      </h2>
      <p class="mt-3 text-sm leading-6 text-brand-primary/60 max-w-md">
        {{ 'wardrobe.emptySubtitle' | transloco }}
      </p>

      <!-- Action Suite -->
      <div class="mt-8 flex flex-col sm:flex-row gap-4 items-center">
        <button
          type="button"
          (click)="addItem.emit()"
          class="btn-premium px-8 py-3.5 text-xs uppercase tracking-wider font-bold shadow-premium"
        >
          + {{ 'wardrobe.addFirstItem' | transloco }}
        </button>
        <a
          routerLink="/shop"
          class="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-brand-primary/70 hover:text-brand-accent transition-colors py-3"
        >
          {{ 'wardrobe.exploreStore' | transloco }} &rarr;
        </a>
      </div>
    </div>
  `,
  styles: [`
    @keyframes subtleSwing {
      0%, 100% {
        transform: rotate(0deg);
      }
      25% {
        transform: rotate(4deg);
      }
      75% {
        transform: rotate(-4deg);
      }
    }
    .hanger-swing {
      animation: subtleSwing 4s ease-in-out infinite;
      transform-origin: 50% 10%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeEmptyStateComponent {
  addItem = output<void>();
}
