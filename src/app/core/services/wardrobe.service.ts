import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { WardrobeItem } from '../models/iwardrobe';
import { ProductCardModel } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class WardrobeService {
  private http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/wardrobeItems`;
  private readonly defaultUserId = 'guest';

  getItems(userId?: string | number): Observable<WardrobeItem[]> {
    const params = new HttpParams()
      .set('userId', this.normalizeUserId(userId))
      .set('_sort', 'createdAt')
      .set('_order', 'desc');

    return this.http.get<WardrobeItem[]>(this.endpoint, { params });
  }

  addProduct(product: ProductCardModel, userId?: string | number): Observable<WardrobeItem> {
    const normalizedUserId = this.normalizeUserId(userId);
    const params = new HttpParams().set('userId', normalizedUserId).set('type', 'product');

    return this.http.get<WardrobeItem[]>(this.endpoint, { params }).pipe(
      switchMap((items) => {
        const existing = items.find((item) => String(item.productId) === String(product.id));

        if (existing) {
          return of(existing);
        }

        const item: WardrobeItem = {
          id: this.createId('product', product.id),
          userId: normalizedUserId,
          type: 'product',
          productId: product.id,
          product,
          imageUrl: product.image,
          title: product.en.title,
          createdAt: new Date().toISOString(),
        };

        return this.http.post<WardrobeItem>(this.endpoint, item);
      }),
    );
  }

  addMockUploadedImage(payload: {
    imageUrl: string;
    title?: string;
    note?: string;
    userId?: string | number;
  }): Observable<WardrobeItem> {
    // TODO: Replace mock image URL with real multipart upload endpoint during backend integration.
    const item: WardrobeItem = {
      id: this.createId('upload'),
      userId: this.normalizeUserId(payload.userId),
      type: 'upload',
      imageUrl: payload.imageUrl,
      title: payload.title,
      note: payload.note,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<WardrobeItem>(this.endpoint, item);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  update(id: string, changes: Partial<WardrobeItem>): Observable<WardrobeItem> {
    return this.http.patch<WardrobeItem>(`${this.endpoint}/${encodeURIComponent(id)}`, changes);
  }

  private normalizeUserId(userId?: string | number): string {
    return String(userId ?? this.defaultUserId);
  }

  private createId(type: WardrobeItem['type'], seed?: string | number): string {
    const unique =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const seedPart = seed === undefined ? '' : `${seed}-`;

    return `wardrobe-${type}-${seedPart}${unique}`;
  }
}
