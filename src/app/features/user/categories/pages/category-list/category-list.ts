import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { categoryStore } from '../../category.store';
import { PreferencesStore } from '../../../../../core/stores/preferences.store';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList implements OnInit {
  categoryStore = inject(categoryStore);
  activeLang = inject(PreferencesStore).language;

  filterOptions: { label: string; value: 'all' | 'fashion' | 'essentials' | 'gear' }[] = [
    { label: 'common.all', value: 'all' },
    { label: 'shop.filters.types.fashion', value: 'fashion' },
    { label: 'shop.filters.types.essentials', value: 'essentials' },
    { label: 'shop.filters.types.gear', value: 'gear' },
  ];

  sortOptions = [
    { label: 'shop.filters.sort.featured', value: 'featured' },
    { label: 'shop.filters.sort.az', value: 'az' },
    { label: 'shop.filters.sort.za', value: 'za' },
  ];

  ngOnInit(): void {
    this.categoryStore.loadCategories();
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.categoryStore.updateSearchQuery(input.value);
  }

  onSortChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.categoryStore.updateSortBy(select.value as any);
  }

  hasNoResults = computed(() => {
    return (
      !this.categoryStore.isLoading() &&
      this.categoryStore.filteredCategories().length === 0
    );
  });
}
