import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TestimonialContent {
  quote: string;
  author: string;
  role: string;
}

export interface Testimonial {
  id: number | string;
  rating: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  en: TestimonialContent;
  ar: TestimonialContent;
}

@Injectable({
  providedIn: 'root',
})
export class TestimonialService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/testimonials`;

  getTestimonials(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${this.apiUrl}?isActive=true`);
  }
}
