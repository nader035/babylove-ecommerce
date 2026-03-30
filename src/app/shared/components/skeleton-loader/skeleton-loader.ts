import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton-shimmer"
      [class]="variantClass()"
      [style.width]="width()"
      [style.height]="height()"
      [style.border-radius]="radius()"
      role="progressbar"
      aria-label="Loading content"
    ></div>
  `,
  styles: `
    :host {
      display: block;
    }
    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        rgba(61, 33, 79, 0.06) 25%,
        rgba(61, 33, 79, 0.12) 50%,
        rgba(61, 33, 79, 0.06) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.6s ease-in-out infinite;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .skeleton-card {
      width: 100%;
      height: 380px;
      border-radius: 1.5rem;
    }
    .skeleton-text {
      width: 100%;
      height: 1rem;
      border-radius: 0.5rem;
    }
    .skeleton-image {
      width: 100%;
      aspect-ratio: 4/5;
      border-radius: 1.5rem;
    }
    .skeleton-circle {
      width: 3rem;
      height: 3rem;
      border-radius: 9999px;
    }
    .skeleton-button {
      width: 100%;
      height: 3rem;
      border-radius: 9999px;
    }
  `,
})
export class SkeletonLoader {
  variant = input<'card' | 'text' | 'image' | 'circle' | 'button' | 'custom'>('card');
  width = input<string>('');
  height = input<string>('');
  radius = input<string>('');

  variantClass() {
    if (this.variant() === 'custom') return 'skeleton-shimmer';
    return `skeleton-${this.variant()}`;
  }
}
