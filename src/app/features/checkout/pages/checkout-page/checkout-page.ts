import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTruck,
  faCreditCard,
  faClipboardCheck,
  faCheck,
  faChevronLeft,
  faLock,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { CartStore } from '../../../../core/stores/cart.store';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, FontAwesomeModule],
  templateUrl: './checkout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  cartStore = inject(CartStore);

  step = signal(1);
  isPlacing = signal(false);
  orderNumber = signal('');

  icons = {
    truck: faTruck,
    card: faCreditCard,
    review: faClipboardCheck,
    check: faCheck,
    back: faChevronLeft,
    lock: faLock,
    circleCheck: faCircleCheck,
  };

  checkoutForm = signal({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'credit_card',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: '',
  });

  steps = [
    { num: 1, labelKey: 'checkout.shippingAddress', icon: faTruck },
    { num: 2, labelKey: 'checkout.paymentMethod', icon: faCreditCard },
    { num: 3, labelKey: 'checkout.reviewOrder', icon: faClipboardCheck },
  ];

  isShippingValid = computed(() => {
    const d = this.checkoutForm();
    return !!d.fullName.trim() && !!d.phone.trim() && !!d.address.trim() && !!d.city.trim();
  });

  isPaymentValid = computed(() => {
    const d = this.checkoutForm();
    if (d.paymentMethod === 'cash_on_delivery') return true;
    return !!d.cardNumber.trim() && !!d.cardExpiry.trim() && !!d.cardCvv.trim() && !!d.cardName.trim();
  });

  updateField(field: string, value: string) {
    this.checkoutForm.update((s) => ({ ...s, [field]: value }));
  }

  setPaymentMethod(method: string) {
    this.checkoutForm.update((s) => ({ ...s, paymentMethod: method }));
  }

  nextStep() {
    if (this.step() === 1 && this.isShippingValid()) {
      this.step.set(2);
    } else if (this.step() === 2 && this.isPaymentValid()) {
      this.step.set(3);
    }
  }

  prevStep() {
    if (this.step() > 1) {
      this.step.update((s) => s - 1);
    }
  }

  goToStep(num: number) {
    if (num < this.step()) {
      this.step.set(num);
    }
  }

  placeOrder() {
    this.isPlacing.set(true);
    // Simulate API call
    setTimeout(() => {
      this.orderNumber.set('BL-' + Math.random().toString(36).substring(2, 8).toUpperCase());
      this.cartStore.clearCart();
      this.isPlacing.set(false);
      this.step.set(4);
      this.notificationService.success('Order placed successfully!');
    }, 1500);
  }
}
