import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BlogContent {
  title: string;
  excerpt: string;
  content: string;
}

export interface Blog {
  id: number;
  slug: string;
  author: string;
  authorImage: string;
  date: string;
  category: string;
  image: string;
  readingTime: string;
  relatedProductIds?: number[];
  en: BlogContent;
  ar: BlogContent;
}

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = environment.blogsApi;

  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.apiUrl);
  }

  getBlogById(id: number): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${id}`);
  }

  getBlogBySlug(slug: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.apiUrl}?slug=${slug}`);
  }
}
