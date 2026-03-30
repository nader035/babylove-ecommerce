import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
} from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { categoryStore } from '../../category.store';
import { CategoryCard } from '../../components/category-card/category-card';
import { register } from 'swiper/element/bundle';

register();
@Component({
  selector: 'app-category-list',
  imports: [TranslocoModule, CategoryCard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryList implements OnInit {
  categoryStore = inject(categoryStore);
  ngOnInit(): void {
    this.categoryStore.loadCategories();
  }
  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.categoryStore.updateSearchQuery(input.value);
  }
}
