import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin, map, Observable, of } from 'rxjs';
import { Product } from '../models/icatalog';
import { environment } from '../../../environments/environment';

export type ProductQueryParams = {
  categorySlug?: string;
  type?: string;
  searchQuery?: string;
  sortBy?: 'featured' | 'priceAsc' | 'priceDesc' | 'rating';
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
};

export type PriceBounds = {
  min: number;
  max: number;
};

export type ProductListResponse = {
  items: ProductCardModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type ProductCardModel = {
  id: number | string;
  slug: string;
  image: string;
  categorySlug: string;
  categoryTitle: { en: string; ar: string };
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

  searchProducts(term: string, limit = 5): Observable<ProductCardModel[]> {
    const searchQuery = term.trim();
    if (!searchQuery) {
      return of([]);
    }

    const queryString = this._buildProductsQuery({
      searchQuery,
      page: 1,
      pageSize: Math.max(1, limit),
      sortBy: 'rating',
    });

    return this.http
      .get<Product[]>(`${environment.productsApi}${queryString}`)
      .pipe(map((products) => products.map((product) => this._toCard(product))));
  }

  getPriceBounds(
    query?: Pick<ProductQueryParams, 'categorySlug' | 'type' | 'searchQuery'>,
  ): Observable<PriceBounds> {
    const baseQuery = {
      categorySlug: query?.categorySlug,
      type: query?.type,
      searchQuery: query?.searchQuery,
      page: 1,
      pageSize: 1,
    };

    const minQuery = this._buildProductsQuery({ ...baseQuery, sortBy: 'priceAsc' });
    const maxQuery = this._buildProductsQuery({ ...baseQuery, sortBy: 'priceDesc' });

    return forkJoin({
      minProduct: this.http.get<Product[]>(`${environment.productsApi}${minQuery}`),
      maxProduct: this.http.get<Product[]>(`${environment.productsApi}${maxQuery}`),
    }).pipe(
      map(({ minProduct, maxProduct }) => {
        const min = Number(minProduct[0]?.['price'] ?? 0);
        const max = Number(maxProduct[0]?.['price'] ?? min);
        const safeMin = Number.isFinite(min) ? min : 0;
        const safeMax = Number.isFinite(max) ? max : safeMin;

        return {
          min: safeMin,
          max: Math.max(safeMin, safeMax),
        };
      }),
    );
  }

  getProductById(id: number | string): Observable<Product> {
    return this.http
      .get<
        Product[]
      >(`${environment.productsApi}/?id=${encodeURIComponent(String(id))}&_expand=category`)
      .pipe(
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

  getProductCardById(id: number | string): Observable<ProductCardModel> {
    return this.getProductById(id).pipe(map((p) => this._toCard(p)));
  }

  getRelatedProducts(
    categoryId: number | string,
    excludeId: number | string,
  ): Observable<ProductCardModel[]> {
    return this.http
      .get<
        Product[]
      >(`${environment.productsApi}/?categoryId=${encodeURIComponent(String(categoryId))}&_expand=category`)
      .pipe(
        map((products) =>
          products
            .filter((p) => String(p.id) !== String(excludeId))
            .map((product) => this._toCard(product)),
        ),
      );
  }

  private _toCard(product: Product): ProductCardModel {
    const prices = product.skus?.map((sku) => sku.price) ?? [];
    const minPrice =
      prices.length > 0 ? Math.min(...prices) : Number(product.minPrice ?? product['price'] ?? 0);
    const maxPrice =
      prices.length > 0
        ? Math.max(...prices)
        : Number(product.maxPrice ?? product.minPrice ?? minPrice);

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
      categoryTitle: {
        en: product.category?.en?.title || product['categoryTitle'] || 'Premium',
        ar: product.category?.ar?.title || product['categoryTitle'] || 'فاخر',
      },
      price: minPrice,
      oldPrice: maxPrice > minPrice ? maxPrice : undefined,
      rating: Number(rating.toFixed(1)),
      reviewCount: product.reviewCount ?? product.reviews?.length ?? 0,
      type: (product.typeKey || product.type || '').toLowerCase(),
      en: {
        title: product.en?.title || '',
        shortDescription: product.en?.shortDescription || '',
      },
      ar: {
        title: product.ar?.title || '',
        shortDescription: product.ar?.shortDescription || '',
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
      const typeValue = query.type.toLowerCase();
      params.set('typeKey', typeValue);
      params.set('type', typeValue);
    }

    if (typeof query?.minPrice === 'number' && Number.isFinite(query.minPrice)) {
      params.set('price_gte', query.minPrice.toString());
    }

    if (typeof query?.maxPrice === 'number' && Number.isFinite(query.maxPrice)) {
      params.set('price_lte', query.maxPrice.toString());
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
