import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifications = signal<Notification[]>([]);
  private _nextId = 0;

  readonly notifications = this._notifications.asReadonly();

  success(message: string, duration = 4000) {
    this._add(message, 'success', duration);
  }

  error(message: string, duration = 5000) {
    this._add(message, 'error', duration);
  }

  warning(message: string, duration = 4000) {
    this._add(message, 'warning', duration);
  }

  info(message: string, duration = 3500) {
    this._add(message, 'info', duration);
  }

  dismiss(id: number) {
    this._notifications.update((list) => list.filter((n) => n.id !== id));
  }

  private _add(message: string, type: NotificationType, duration: number) {
    const id = ++this._nextId;
    this._notifications.update((list) => [...list, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
