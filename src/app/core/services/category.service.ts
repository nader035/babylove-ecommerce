import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Category, MOCK_CATEGORIES } from '../constants/mock-data';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  getCategories(): Observable<Category[]> {
    return of(MOCK_CATEGORIES).pipe(delay(1000));
  }

  getCategoryBySlug(slug: string): Observable<Category | undefined> {
    const category = MOCK_CATEGORIES.find((cat) => cat.slug === slug);
    return of(category).pipe(delay(500));
  }
}
