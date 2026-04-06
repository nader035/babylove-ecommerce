import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/icatalog';
import { environment } from '../../../environments/environment';

export type ProductCardModel = {
  [key: string]: any;
  id: number;
  slug: string;
  image: string;
  categorySlug: string;
  categoryTitle: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  type: string;
  en: { title: string; shortDescription: string };
  ar: { title: string; shortDescription: string };
};

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(): Observable<ProductCardModel[]> {
    return this.http.get<Product[]>(`${environment.productsApi}?_expand=category`).pipe(
      map((products) => products.map((product) => this._toCard(product))),
    );
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product[]>(`${environment.productsApi}/?id=${id}&_expand=category`).pipe(
      map((products) => {
        if (!products.length) throw new Error('Product not found');
        return products[0];
      }),
    );
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product[]>(`${environment.productsApi}/?slug=${slug}&_expand=category`).pipe(
      map((products) => {
        if (!products.length) throw new Error('Product not found');
        return products[0];
      }),
    );
  }

  getProductCardById(id: number): Observable<ProductCardModel> {
    return this.getProductById(id).pipe(map((p) => this._toCard(p)));
  }

  getRelatedProducts(
    categoryId: number,
    excludeId: number,
  ): Observable<ProductCardModel[]> {
    return this.http
      .get<Product[]>(`${environment.productsApi}/?categoryId=${categoryId}&_expand=category`)
      .pipe(
        map((products) =>
          products
            .filter((p) => p.id !== excludeId)
            .map((product) => this._toCard(product)),
        ),
      );
  }

  private _toCard(product: Product): ProductCardModel {
    const prices = product.skus?.map((sku) => sku.price) ?? [];
    const minPrice = prices.length ? Math.min(...prices) : (product['price'] || 0);
    const maxPrice = prices.length ? Math.max(...prices) : minPrice;
    
    const rating = product['rating'] || (product.reviews?.length
      ? product.reviews.reduce((sum, item) => sum + item['rate'], 0) /
        product.reviews.length
      : 4.8);
    const image =
      product.thumbnail ||
      product.images?.[0] ||
      product.skus?.[0]?.images?.[0]?.image ||
      'assets/images/hero-model.jpg';

    return {
      id: product.id,
      slug: product.slug,
      image,
      categorySlug: product['categorySlug'] || 'all',
      categoryTitle: product['categoryTitle'] || 'Premium',
      price: minPrice,
      oldPrice: maxPrice > minPrice ? maxPrice : undefined,
      rating: Number(rating.toFixed(1)),
      reviewCount: product.reviews?.length ?? 0,
      type: product.type || '',
      en: {
        title: product.en.title,
        shortDescription: product.en.shortDescription,
      },
      ar: {
        title: product.ar.title,
        shortDescription: product.ar.shortDescription,
      },
    };
  }
}
