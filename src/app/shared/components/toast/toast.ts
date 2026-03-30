import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-24 z-[100] flex flex-col gap-3 inset-e-6 w-fit max-w-sm" role="alert" aria-live="polite">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          class="toast-item flex items-start gap-3 rounded-2xl border px-5 py-4 shadow-premium backdrop-blur-xl"
          [class]="getClasses(notification.type)"
        >
          <span class="mt-0.5 text-lg leading-none">{{ getIcon(notification.type) }}</span>
          <p class="flex-1 text-sm font-medium leading-snug">{{ notification.message }}</p>
          <button
            (click)="notificationService.dismiss(notification.id)"
            class="mt-0.5 text-xs opacity-60 transition-opacity hover:opacity-100"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .toast-item {
      animation: toast-slide-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
    }
    @keyframes toast-slide-in {
      from {
        opacity: 0;
        transform: translateX(40px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateX(0) scale(1);
      }
    }
    .toast-success {
      background: rgba(240, 253, 244, 0.95);
      border-color: rgba(34, 197, 94, 0.25);
      color: #166534;
    }
    .toast-error {
      background: rgba(254, 242, 242, 0.95);
      border-color: rgba(239, 68, 68, 0.25);
      color: #991b1b;
    }
    .toast-warning {
      background: rgba(255, 251, 235, 0.95);
      border-color: rgba(245, 158, 11, 0.25);
      color: #92400e;
    }
    .toast-info {
      background: rgba(239, 246, 255, 0.95);
      border-color: rgba(59, 130, 246, 0.25);
      color: #1e40af;
    }
  `,
})
export class Toast {
  notificationService = inject(NotificationService);

  getClasses(type: string): string {
    return `toast-${type}`;
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}
