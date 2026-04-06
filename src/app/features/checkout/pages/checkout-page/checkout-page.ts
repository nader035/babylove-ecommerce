import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faTruck, 
  faCreditCard, 
  faCheckCircle, 
  faChevronLeft, 
  faLock,
  faCircleCheck,
  faShoppingBag,
  faArrowLeft,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { CartStore } from '../../../../core/stores/cart.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPage {
  cartStore = inject(CartStore);
  activeLang = inject(PreferencesStore).language;
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  step = signal(1);
  isPlacing = signal(false); 
  orderNumber = signal('');

  steps = [
    { num: 1, labelKey: 'checkout.steps.shipping' },
    { num: 2, labelKey: 'checkout.steps.payment' },
    { num: 3, labelKey: 'checkout.steps.review' },
  ];

  icons = {
    truck: faTruck,
    card: faCreditCard,
    review: faCheckCircle,
    back: faChevronLeft,
    lock: faLock,
    circleCheck: faCircleCheck,
    bag: faShoppingBag,
    arrowLeft: faArrowLeft,
    check: faCheck
  };

  checkoutForm = signal({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'credit_card',
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  isShippingValid = computed(() => {
    const f = this.checkoutForm();
    return f.fullName && f.phone && f.address && f.city;
  });

  isPaymentValid = computed(() => {
    const f = this.checkoutForm();
    if (f.paymentMethod === 'cash_on_delivery') return true;
    return f.cardName && f.cardNumber.length >= 16 && f.cardExpiry && f.cardCvv;
  });

  updateField(field: string, value: string) {
    this.checkoutForm.update(f => ({ ...f, [field]: value }));
  }

  setPaymentMethod(method: string) {
    this.checkoutForm.update(f => ({ ...f, paymentMethod: method }));
  }

  nextStep() {
    if (this.step() < 3) this.step.update(s => s + 1);
    window.scrollTo(0, 0);
  }

  prevStep() {
    if (this.step() > 1) this.step.update(s => s - 1);
    window.scrollTo(0, 0);
  }

  goToStep(s: number) {
    if (s < this.step()) this.step.set(s);
  }

  async placeOrder() {
    this.isPlacing.set(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const num = 'ORD-' + Math.random().toString().slice(2, 10);
    this.orderNumber.set(num);
    this.step.set(4);
    this.cartStore.clearCart();
    this.notificationService.success('Order placed successfully');
    window.scrollTo(0, 0);
  }
}
