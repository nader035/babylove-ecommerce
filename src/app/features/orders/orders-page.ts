import { ChangeDetectionStrategy, Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBox,
  faTruck,
  faCheckCircle,
  faSpinner,
  faClock,
  faTimesCircle,
  faChevronRight,
  faShoppingBag,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { PreferencesStore } from '../../core/stores/preferences.store';

interface LocalizedString {
  en: string;
  ar: string;
}

interface OrderItem {
  productId: number;
  skuId: number;
  quantity: number;
  price: number;
  title: LocalizedString;
  image: string;
}

interface Order {
  id: string;
  userId: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    country: string;
  };
}

@Component({
  selector: 'app-orders-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './orders-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersPage implements OnInit {
  private http = inject(HttpClient);
  private preferencesStore = inject(PreferencesStore);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  expandedOrderId = signal<string | null>(null);

  activeLang = computed(() => this.preferencesStore.language());

  icons = {
    box: faBox,
    truck: faTruck,
    check: faCheckCircle,
    spinner: faSpinner,
    clock: faClock,
    cancel: faTimesCircle,
    chevron: faChevronRight,
    bag: faShoppingBag,
    returnIcon: faRotateLeft,
  };

  ngOnInit() {
    this.http.get<Order[]>(environment.ordersApi).subscribe({
      next: (orders) => {
        this.orders.set(orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleOrder(id: string) {
    this.expandedOrderId.update((current) => (current === id ? null : id));
  }

  getStatusIcon(status: string) {
    switch (status) {
      case 'delivered': return this.icons.check;
      case 'shipped': return this.icons.truck;
      case 'processing': return this.icons.spinner;
      case 'cancelled': return this.icons.cancel;
      default: return this.icons.clock;
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'shipped': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-amber-600 bg-amber-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-brand-primary/60 bg-brand-bg-light';
    }
  }

  getItemCount(order: Order): number {
    return order.items.reduce((acc, item) => acc + item.quantity, 0);
  }
}
