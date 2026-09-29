import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBookmark, faImages, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { TranslocoModule } from '@jsverse/transloco';
import { WardrobeItem } from '../../../../../core/models/iwardrobe';
import { PreferencesStore } from '../../../../../core/stores/preferences.store';

@Component({
  selector: 'app-wardrobe-item-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, TranslocoModule],
  templateUrl: './wardrobe-item-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WardrobeItemCardComponent {
  private preferencesStore = inject(PreferencesStore);

  item = input.required<WardrobeItem>();
  removeItem = output<string>();

  activeLang = this.preferencesStore.language;
  currencyCode = this.preferencesStore.currency;

  icons = {
    product: faBookmark,
    upload: faImages,
    trash: faTrashAlt,
  };

  isProduct = computed(() => this.item().type === 'product');
  imageUrl = computed(
    () => this.item().product?.image || this.item().imageUrl || 'assets/images/mock/wardrobe/outfit-1.svg',
  );
  productSlug = computed(() => this.item().product?.slug ?? null);
  productPrice = computed(() => this.item().product?.price ?? null);

  title = computed(() => {
    const item = this.item();
    const product = item.product;
    const lang = this.activeLang();

    if (product) {
      return product[lang]?.title || product.en.title;
    }

    return item.title || '';
  });

  subtitle = computed(() => {
    const item = this.item();
    const product = item.product;
    const lang = this.activeLang();

    if (product) {
      return product.categoryTitle[lang] || product.categoryTitle.en;
    }

    return item.note || '';
  });

  onRemove(): void {
    this.removeItem.emit(this.item().id);
  }
}
