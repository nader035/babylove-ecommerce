import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryContent {
  title: string;
  description: string;
  types: string[];
}

export interface Category {
  id: number;
  slug: string;
  icon: string;
  parentId: number | null;
  en: CategoryContent;
  ar: CategoryContent;
}

export type CategoryCardModel = {
  [key: string]: any;
  
  id: number;
  slug: string;
  icon: string;
  en: CategoryContent;
  ar: CategoryContent;
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
          slug: item.slug,
          icon: item.icon,
          en: item.en,
          ar: item.ar,
        })),
      ),
    );
  }

  getCategoryBySlug(slug: string): Observable<CategoryCardModel | undefined> {
    return this.getCategories().pipe(map((categories) => categories.find((cat) => cat.slug === slug)));
  }
}
