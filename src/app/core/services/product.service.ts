import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Product } from '../models/icatalog';
import { environment } from '../../../environments/environment';

export type ProductQueryParams = {
  categorySlug?: string;
  type?: string;
  searchQuery?: string;
  sortBy?: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  page?: number;
  pageSize?: number;
};

export type ProductListResponse = {
  items: ProductCardModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

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

  getProducts(query?: ProductQueryParams): Observable<ProductCardModel[]> {
    return this.getProductsPage(query).pipe(map((response) => response.items));
  }

  getProductsPage(query?: ProductQueryParams): Observable<ProductListResponse> {
    const queryString = this._buildProductsQuery(query);
    return this.http
      .get<Product[]>(`${environment.productsApi}${queryString}`, { observe: 'response' })
      .pipe(
        map((response) => {
          const rawProducts = response.body ?? [];
          const items = rawProducts.map((product) => this._toCard(product));

          const parsedPage = Number(query?.page ?? 1);
          const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

          const parsedPageSize = Number(query?.pageSize ?? 12);
          const pageSize =
            Number.isFinite(parsedPageSize) && parsedPageSize > 0 ? parsedPageSize : 12;

          const totalHeader = response.headers.get('X-Total-Count');
          const parsedTotal = totalHeader ? Number(totalHeader) : NaN;
          const total =
            Number.isFinite(parsedTotal) && parsedTotal >= 0 ? parsedTotal : items.length;

          return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
          };
        }),
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
    return this.http
      .get<Product[]>(`${environment.productsApi}/?slug=${slug}&_expand=category`)
      .pipe(
        map((products) => {
          if (!products.length) throw new Error('Product not found');
          return products[0];
        }),
      );
  }

  getProductCardById(id: number): Observable<ProductCardModel> {
    return this.getProductById(id).pipe(map((p) => this._toCard(p)));
  }

  getRelatedProducts(categoryId: number, excludeId: number): Observable<ProductCardModel[]> {
    return this.http
      .get<Product[]>(`${environment.productsApi}/?categoryId=${categoryId}&_expand=category`)
      .pipe(
        map((products) =>
          products.filter((p) => p.id !== excludeId).map((product) => this._toCard(product)),
        ),
      );
  }

  private _toCard(product: Product): ProductCardModel {
    const prices = product.skus?.map((sku) => sku.price) ?? [];
    const minPrice = prices.length ? Math.min(...prices) : product['price'] || 0;
    const maxPrice = prices.length ? Math.max(...prices) : minPrice;

    const rating =
      product['rating'] ||
      (product.reviews?.length
        ? product.reviews.reduce((sum, item) => sum + item['rate'], 0) / product.reviews.length
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

  private _buildProductsQuery(query?: ProductQueryParams): string {
    const params = new URLSearchParams();
    params.set('_expand', 'category');

    if (query?.page && query.page > 0) {
      params.set('_page', query.page.toString());
    }

    if (query?.pageSize && query.pageSize > 0) {
      params.set('_limit', query.pageSize.toString());
    }

    if (query?.categorySlug && query.categorySlug !== 'all') {
      params.set('categorySlug', query.categorySlug);
    }

    if (query?.type && query.type !== 'all') {
      params.set('type', query.type.toLowerCase());
    }

    if (query?.searchQuery?.trim()) {
      params.set('q', query.searchQuery.trim());
    }

    if (query?.sortBy === 'priceAsc') {
      params.set('_sort', 'price');
      params.set('_order', 'asc');
    } else if (query?.sortBy === 'priceDesc') {
      params.set('_sort', 'price');
      params.set('_order', 'desc');
    } else if (query?.sortBy === 'rating') {
      params.set('_sort', 'rating');
      params.set('_order', 'desc');
    }

    return `?${params.toString()}`;
  }
}
