import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrashAlt, faMinus, faPlus, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { CartStore } from '../../../../core/stores/cart.store';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './cart-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartPage {
  cartStore = inject(CartStore);
  private notificationService = inject(NotificationService);

  icons = {
    trash: faTrashAlt,
    minus: faMinus,
    plus: faPlus,
    bag: faShoppingBag,
  };

  removeItem(productId: number, title: string) {
    this.cartStore.removeFromCart(productId);
    this.notificationService.info(`${title} removed from cart`);
  }
}
