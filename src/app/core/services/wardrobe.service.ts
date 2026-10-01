import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ClothingType,
  WardrobeItem,
  WardrobeItemColor,
  WardrobeItemSource,
  ClothingSymbol,
  createProductSnapshot,
  productTypeToClothingType,
} from '../models/iwardrobe';
import { ProductCardModel } from './product.service';

export interface AddWardrobeItemPayload {
  userId?: string | number;
  clothingType: ClothingType;
  source: WardrobeItemSource;
  name: string;
  color?: WardrobeItemColor;
  size?: string;
  notes?: string;
  imageUrl?: string;
  symbol?: ClothingSymbol;
  productId?: string | number;
  productSnapshot?: WardrobeItem['productSnapshot'];
}

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

  addItem(payload: AddWardrobeItemPayload): Observable<WardrobeItem> {
    const item: WardrobeItem = {
      id: this.createId(),
      userId: this.normalizeUserId(payload.userId),
      clothingType: payload.clothingType,
      source: payload.source,
      name: payload.name,
      color: payload.color,
      size: payload.size,
      notes: payload.notes,
      imageUrl: payload.imageUrl,
      symbol: payload.symbol,
      productId: payload.productId,
      productSnapshot: payload.productSnapshot,
      createdAt: new Date().toISOString(),
    };

    return this.http.post<WardrobeItem>(this.endpoint, item);
  }

  addFromProduct(
    product: ProductCardModel,
    userId?: string | number,
  ): Observable<WardrobeItem> {
    const normalizedUserId = this.normalizeUserId(userId);

    // Check if product already exists in wardrobe
    const params = new HttpParams()
      .set('userId', normalizedUserId)
      .set('source', 'product')
      .set('productId', String(product.id));

    return this.http.get<WardrobeItem[]>(this.endpoint, { params }).pipe(
      switchMap((existing) => {
        if (existing.length > 0) {
          return of(existing[0]);
        }

        return this.addItem({
          userId: normalizedUserId,
          clothingType: productTypeToClothingType(product.type),
          source: 'product',
          name: product.en.title,
          imageUrl: product.image,
          productId: product.id,
          productSnapshot: createProductSnapshot(product),
        });
      }),
    );
  }

  updateItem(id: string, changes: Partial<WardrobeItem>): Observable<WardrobeItem> {
    return this.http.patch<WardrobeItem>(
      `${this.endpoint}/${encodeURIComponent(id)}`,
      { ...changes, updatedAt: new Date().toISOString() },
    );
  }

  removeItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${encodeURIComponent(id)}`);
  }

  private normalizeUserId(userId?: string | number): string {
    return String(userId ?? this.defaultUserId);
  }

  private createId(): string {
    const unique =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    return `w-${unique}`;
  }
}
