import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { categoryStore } from '../../category.store';
import { CategoryCard } from '../../components/category-card/category-card';
import { RouterLink } from '@angular/router';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-category-list',
  imports: [TranslocoModule, CategoryCard, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList implements OnInit {
  categoryStore = inject(categoryStore);
  filterOptions: Array<{ value: 'all' | 'essentials' | 'fashion' | 'gear'; label: string }> = [
    { value: 'all', label: 'shop.filters.types.all' },
    { value: 'essentials', label: 'shop.filters.types.essentials' },
    { value: 'fashion', label: 'shop.filters.types.fashion' },
    { value: 'gear', label: 'shop.filters.types.gear' },
  ];
  sortOptions: Array<{ value: 'featured' | 'az' | 'za'; label: string }> = [
    { value: 'featured', label: 'shop.filters.sort.featured' },
    { value: 'az', label: 'shop.filters.sort.az' },
    { value: 'za', label: 'shop.filters.sort.za' },
  ];
  hasNoResults = computed(
    () => !this.categoryStore.isLoading() && this.categoryStore.filteredCategories().length === 0,
  );

  ngOnInit(): void {
    this.categoryStore.loadCategories();
  }

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.categoryStore.updateSearchQuery(input.value);
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'featured' | 'az' | 'za';
    this.categoryStore.updateSortBy(value);
  }
}
