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
  id: number | string;
  slug: string;
  author: string;
  authorImage: string;
  date: string;
  category: string;
  image: string;
  readingTime: string;
  relatedProductIds?: Array<number | string>;
  status?: 'draft' | 'published' | 'archived';
  isFeatured?: boolean;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
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
    return this.http.get<Blog[]>(`${this.apiUrl}?status=published`);
  }

  getBlogById(id: number | string): Observable<Blog> {
    return this.http.get<Blog>(`${this.apiUrl}/${encodeURIComponent(String(id))}`);
  }

  getBlogBySlug(slug: string): Observable<Blog[]> {
    return this.http.get<Blog[]>(
      `${this.apiUrl}?slug=${encodeURIComponent(slug)}&status=published`,
    );
  }
}
