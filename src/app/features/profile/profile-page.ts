import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { AuthStore } from '../auth/auth.store';


@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslocoModule, FontAwesomeModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePage {
  auth = inject(AuthStore);
  wishlistStore = inject(WishlistStore);
  cartStore = inject(CartStore);
  fb = inject(FormBuilder);
  
  isEditing = signal(false);
  previewImage = signal<string | null>(null);

  profileForm: FormGroup = this.fb.group({
    firstName: [this.auth.user()?.firstName || '', Validators.required],
    lastName: [this.auth.user()?.lastName || '', Validators.required],
    phoneNumber: [this.auth.user()?.phoneNumber || ''],
    image: [this.auth.user()?.image || '']
  });

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
    camera: faCamera,
  };

  toggleEditMode() {
    if (this.isEditing()) {
      // Cancel edit, reset form
      this.isEditing.set(false);
      this.previewImage.set(null);
      this.profileForm.patchValue({
        firstName: this.auth.user()?.firstName || '',
        lastName: this.auth.user()?.lastName || '',
        phoneNumber: this.auth.user()?.phoneNumber || '',
        image: this.auth.user()?.image || ''
      });
    } else {
      // Enter edit mode
      this.isEditing.set(true);
      // Sync form with current store state in case it updated
      this.profileForm.patchValue({
        firstName: this.auth.user()?.firstName || '',
        lastName: this.auth.user()?.lastName || '',
        phoneNumber: this.auth.user()?.phoneNumber || '',
        image: this.auth.user()?.image || ''
      });
    }
  }

  onImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.previewImage.set(result);
        this.profileForm.patchValue({ image: result });
      };
      reader.readAsDataURL(file);
    }
  }

  uploadStandaloneImage(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && this.auth.user()) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Immediately save the image if done outside edit mode
        this.auth.updateProfile({ id: this.auth.user()!.id, data: { image: result } });
        // Also update form if currently editing
        this.previewImage.set(result);
        this.profileForm.patchValue({ image: result });
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    if (this.profileForm.valid && this.auth.user()) {
      const updatedData = this.profileForm.value;
      this.auth.updateProfile({ id: this.auth.user()!.id, data: updatedData });
      this.isEditing.set(false);
      this.previewImage.set(null);
    }
  }

  logout() {
    this.auth.logOut();
  }
}
