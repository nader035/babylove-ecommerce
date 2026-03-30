import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faShoppingBag,
  faHeart,
  faMapMarkerAlt,
  faPen,
  faSignOutAlt,
  faShieldHalved,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { AuthStore } from '../auth/auth.store';


@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  auth = inject(AuthStore);
  wishlistStore = inject(WishlistStore);
  cartStore = inject(CartStore);
  isEditing = signal(false);

  icons = {
    user: faUser,
    email: faEnvelope,
    phone: faPhone,
    bag: faShoppingBag,
    heart: faHeart,
    location: faMapMarkerAlt,
    edit: faPen,
    logout: faSignOutAlt,
    shield: faShieldHalved,
    chevron: faChevronRight,
  };

  logout() {
    this.auth.logOut();
  }
}
