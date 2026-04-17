import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LocalizedLookbookContent = {
  kicker: string;
  title: string;
  description: string;
};

export type LookbookHotspot = {
  id: string;
  top: number;
  left: number;
  productTypeFilter?: string;
  categoryFilter?: string;
  en: { label: string };
  ar: { label: string };
};

export type LookbookModule = {
  id: number | string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  image: string;
  imageAlt: string;
  createdAt?: string;
  updatedAt?: string;
  en: LocalizedLookbookContent;
  ar: LocalizedLookbookContent;
  hotspots: LookbookHotspot[];
};

@Injectable({
  providedIn: 'root',
})
export class LookbookService {
  private readonly http = inject(HttpClient);

  getActiveLookbook(): Observable<LookbookModule | null> {
    return this.http
      .get<
        LookbookModule[]
      >(`${environment.lookbooksApi}?isActive=true&_sort=displayOrder&_order=asc&_limit=1`)
      .pipe(map((lookbooks) => lookbooks[0] ?? null));
  }
}
