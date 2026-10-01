import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ClothingSymbol } from '../../../core/models/iwardrobe';

@Component({
  selector: 'app-clothing-symbol',
  standalone: true,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (symbol()) {
        @case ('shirt') {
          <path d="M15 4l6 2v5h-3v8a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1v-8h-3v-5l6 -2a3 3 0 0 0 6 0" />
        }
        @case ('pants') {
          <path d="M3 6h18" />
          <path d="M4 6v10a2 2 0 0 0 2 2h3l1 -4l1 4h3a2 2 0 0 0 2 -2v-10" />
        }
        @case ('dress') {
          <path d="M7 4l-1 2.5l3.5 1l-1 9.5h7l-1 -9.5l3.5 -1l-1 -2.5z" />
          <path d="M10 4a2 2 0 1 1 4 0" />
        }
        @case ('jacket') {
          <path d="M16 4l4 3v8h-4v5h-8v-5h-4v-8l4 -3" />
          <path d="M12 4v5" />
          <path d="M9 4a3 3 0 0 0 6 0" />
        }
        @case ('shoe') {
          <path d="M4 12h5.5l1.5 -1.5a2.1 2.1 0 0 1 3 0l1 1l3 -1.5h2a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1z" />
        }
        @case ('sock') {
          <path d="M13 3v6l4.798 5.142a4 4 0 0 1 -5.441 5.86l-6.736 -6.263a2 2 0 0 1 -.118 -2.818l.118 -.122l3.379 -3.379v-4.42h4z" />
        }
        @case ('tie') {
          <path d="M12 22l4 -4l-2.5 -11l1.5 -4h-6l1.5 4l-2.5 11z" />
          <path d="M10 3h4" />
        }
        @case ('hanger') {
          <path d="M14 6a2 2 0 1 0 -4 0c0 1.667 .67 3 2 4h0c1.33 -1 2 -2.333 2 -4z" />
          <path d="M12 10l-8 6h16z" />
          <path d="M4 16v2h16v-2" />
        }
        @case ('bag') {
          <path d="M8 7a4 4 0 1 1 8 0" />
          <path d="M3 11l1.5 -1h15l1.5 1" />
          <path d="M4.5 10l1 9a1 1 0 0 0 1 1h11a1 1 0 0 0 1 -1l1 -9" />
        }
        @case ('scarf') {
          <path d="M4 12c1 -2 3 -3 5 -3s4 1 5 3s3 3 5 3" />
          <path d="M4 8c1 -2 3 -3 5 -3s4 1 5 3s3 3 5 3" />
          <path d="M19 15v4a2 2 0 0 1 -2 2h-1a2 2 0 0 1 -2 -2v-1" />
        }
        @case ('hat') {
          <path d="M12 3a6 6 0 0 1 6 6h1a2 2 0 0 1 0 4h-14a2 2 0 0 1 0 -4h1a6 6 0 0 1 6 -6z" />
          <path d="M6 13v4a6 6 0 0 0 12 0v-4" />
        }
      }
    </svg>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClothingSymbolComponent {
  symbol = input.required<ClothingSymbol>();
  size = input<number>(24);
}
