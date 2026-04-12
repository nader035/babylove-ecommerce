import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type LocalizedHeroContent = {
  badge: string;
  titlePart1: string;
  titlePart2: string;
  description: string;
  ctaText: string;
  ctaLink: string;
};

export type HeroSlide = {
  id: number;
  slug: string;
  isActive: boolean;
  displayOrder: number;
  imageDesktop: string;
  imageMobile?: string;
  imageAlt: string;
  overlayOpacity: number;
  en: LocalizedHeroContent;
  ar: LocalizedHeroContent;
};

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private readonly http = inject(HttpClient);

  getActiveSlides(): Observable<HeroSlide[]> {
    return this.http
      .get<HeroSlide[]>(`${environment.heroesApi}?isActive=true&_sort=displayOrder&_order=asc`)
      .pipe(
        map((slides) =>
          slides.filter((slide) => slide.isActive).sort((a, b) => a.displayOrder - b.displayOrder),
        ),
      );
  }
}
