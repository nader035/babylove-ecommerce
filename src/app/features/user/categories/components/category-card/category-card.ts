import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Category } from '../../../../../core/constants/mock-data';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-category-card',
  imports: [RouterLink],
  templateUrl: './category-card.html',
  styleUrl: './category-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCard {
  category = input.required<Category>();
}
