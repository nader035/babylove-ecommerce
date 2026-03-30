import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/icatalog';
import { environment } from '../../../environments/environment';

export type ProductCardModel = {
  id: number;
  title: string;
  slug: string;
  image: string;
  categorySlug: string;
  categoryTitle: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  shortDescription: string;
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(): Observable<ProductCardModel[]> {
    return this.http.get<Product[]>(environment.productsApi).pipe(
      map((products) =>
        products.map((product) => this._toCard(product)),
      ),
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${environment.productsApi}/${id}`);
  }

  getRelatedProducts(categoryId: number, excludeId: number): Observable<ProductCardModel[]> {
    return this.http.get<Product[]>(`${environment.productsApi}?categoryId=${categoryId}`).pipe(
      map((products) =>
        products
          .filter((p) => p.id !== excludeId)
          .map((product) => this._toCard(product)),
      ),
    );
  }

  private _toCard(product: Product): ProductCardModel {
    const prices = product.skus?.map((sku) => sku.price) ?? [];
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : minPrice;
    const rating = product.reviews?.length
      ? product.reviews.reduce((sum, item) => sum + item.rate, 0) / product.reviews.length
      : 4.8;
    const image =
      product.thumbnail ||
      product.images?.[0] ||
      product.skus?.[0]?.images?.[0]?.image ||
      'assets/images/hero-model.jpg';
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      image,
      categorySlug: product.category?.slug ?? 'all',
      categoryTitle: product.category?.title ?? 'Premium',
      price: minPrice,
      oldPrice: maxPrice > minPrice ? maxPrice : undefined,
      rating: Number(rating.toFixed(1)),
      reviewCount: product.reviews?.length ?? 0,
      shortDescription: product.shortDescription,
    };
  }
}
