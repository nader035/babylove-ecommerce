import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../models/icatalog';
import { environment } from '../../../environments/environment';

export type CategoryCardModel = {
  id: number;
  name: string;
  slug: string;
  image: string;
  creationAt: string;
  updatedAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);

  getCategories(): Observable<CategoryCardModel[]> {
    return this.http.get<Category[]>(environment.categoriesApi).pipe(
      map((categories) =>
        categories.map((item) => ({
          id: item.id,
          name: item.title,
          slug: item.slug,
          image: item.icon,
          creationAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
      ),
    );
  }

  getCategoryBySlug(slug: string): Observable<CategoryCardModel | undefined> {
    return this.getCategories().pipe(map((categories) => categories.find((cat) => cat.slug === slug)));
  }
}
