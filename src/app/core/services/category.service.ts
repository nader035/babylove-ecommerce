import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryContent {
  title: string;
  description: string;
  types: string[];
}

export interface Category {
  id: number | string;
  slug: string;
  icon: string;
  parentId: number | string | null;
  displayOrder?: number;
  isActive?: boolean;
  typeKeys?: string[];
  createdAt?: string;
  updatedAt?: string;
  en: CategoryContent;
  ar: CategoryContent;
}

export type CategoryCardModel = {
  id: number;
  slug: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
  typeKeys: string[];
  en: CategoryContent;
  ar: CategoryContent;
};

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private categoriesCache$: Observable<CategoryCardModel[]> | null = null;

  getCategories(forceRefresh = false): Observable<CategoryCardModel[]> {
    if (!forceRefresh && this.categoriesCache$) {
      return this.categoriesCache$;
    }

    const request$ = this.http.get<Category[]>(environment.categoriesApi).pipe(
      map((categories) =>
        categories
          .map((item, index) => ({
            id: Number(item.id),
            slug: item.slug,
            icon: item.icon,
            displayOrder: Number(item.displayOrder ?? index + 1),
            isActive: item.isActive ?? true,
            typeKeys: item.typeKeys ?? item.en?.types?.map((type) => type.toLowerCase()) ?? [],
            en: item.en,
            ar: item.ar,
          }))
          .sort((a, b) => a.displayOrder - b.displayOrder),
      ),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

    this.categoriesCache$ = request$;
    return request$;
  }

  getCategoryBySlug(slug: string): Observable<CategoryCardModel | undefined> {
    return this.getCategories().pipe(
      map((categories) => categories.find((cat) => cat.slug === slug)),
    );
  }
}
