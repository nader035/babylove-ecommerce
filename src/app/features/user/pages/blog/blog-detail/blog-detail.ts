import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faClock, faArrowLeft, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { distinctUntilChanged, filter, map, switchMap, of, forkJoin, catchError } from 'rxjs';
import { BlogService, Blog } from '../../../../../core/services/blog.service';
import { ProductService, ProductCardModel } from '../../../../../core/services/product.service';
import { PreferencesStore } from '../../../../../core/stores/preferences.store';
import { ProductCard } from '../../../../../shared/components/product-card/product-card';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FontAwesomeModule, RouterLink, ProductCard],
  templateUrl: './blog-detail.html',
  host: {
    '(window:scroll)': 'onWindowScroll()',
  },
})
export class BlogDetail implements OnInit {
  readonly slug = input<string>();
  private blogService = inject(BlogService);
  private productService = inject(ProductService);
  private preferencesStore = inject(PreferencesStore);

  icons = { calendar: faCalendar, clock: faClock, back: faArrowLeft, share: faShareNodes };

  blog = signal<Blog | null>(null);
  relatedProducts = signal<ProductCardModel[]>([]);
  activeLang = this.preferencesStore.language;
  isLoading = signal(true);
  readingProgress = signal(0);

  onWindowScroll() {
    const totalHeight =
      document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (totalHeight <= 0) {
      this.readingProgress.set(0);
      return;
    }

    this.readingProgress.set((window.scrollY / totalHeight) * 100);
  }

  constructor() {
    toObservable(this.slug)
      .pipe(
        filter((slug): slug is string => !!slug),
        distinctUntilChanged(),
        switchMap((slug) => this.loadBlog(slug)),
        takeUntilDestroyed(),
      )
      .subscribe(({ blog, products }) => {
        this.blog.set(blog);
        this.relatedProducts.set(products);
        this.isLoading.set(false);
      });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  private loadBlog(slug: string) {
    this.isLoading.set(true);
    return this.blogService.getBlogBySlug(slug).pipe(
      map((blogs) => (blogs.length > 0 ? blogs[0] : null)),
      switchMap((blog) => {
        if (!blog || !blog.relatedProductIds?.length) {
          return of({ blog, products: [] as ProductCardModel[] });
        }

        return forkJoin(
          blog.relatedProductIds.map((id) =>
            this.productService.getProductCardById(id).pipe(catchError(() => of(null))),
          ),
        ).pipe(
          map((products) => ({
            blog,
            products: products.filter((p): p is ProductCardModel => p !== null),
          })),
        );
      }),
      catchError(() => {
        this.isLoading.set(false);
        return of({ blog: null, products: [] as ProductCardModel[] });
      }),
    );
  }
}
