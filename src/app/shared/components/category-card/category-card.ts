import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CategoryCardModel } from '../../../core/services/category.service';
import { PreferencesStore } from '../../../core/stores/preferences.store';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './category-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCardComponent {
  activeLang = inject(PreferencesStore).language;
  
  @Input({ required: true }) category!: CategoryCardModel;
}
