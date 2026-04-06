import { Component, OnInit, OnDestroy, inject, signal, HostListener, Input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faClock, faArrowLeft, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { Blog, BlogService } from '../../../core/services/blog.service';
import { ProductCardModel, ProductService } from '../../../core/services/product.service';
import { ProductCard } from '../../../shared/components/product-card/product-card';
import { map, switchMap, of, forkJoin, catchError } from 'rxjs';
import { PreferencesStore } from '../../../core/stores/preferences.store';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, TranslocoModule, FontAwesomeModule, RouterLink, ProductCard],
  templateUrl: './blog-detail.html',
})
export class BlogDetail implements OnInit, OnDestroy {
  @Input() set slug(value: string) {
    this._slug.set(value);
  }

  private _slug = signal<string | null>(null);
  private blogService = inject(BlogService);
  private productService = inject(ProductService);
  private preferencesStore = inject(PreferencesStore);

  icons = { calendar: faCalendar, clock: faClock, back: faArrowLeft, share: faShareNodes };

  blog = signal<Blog | null>(null);
  relatedProducts = signal<ProductCardModel[]>([]);
  activeLang = this.preferencesStore.language;
  isLoading = signal(true);
  readingProgress = signal(0);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const totalHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    this.readingProgress.set((window.scrollY / totalHeight) * 100);
  }

  constructor() {
    effect(() => {
      const currentSlug = this._slug();
      if (currentSlug) {
        this.loadBlog(currentSlug);
      }
    });
  }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

  private loadBlog(slug: string) {
    this.isLoading.set(true);
    this.blogService.getBlogBySlug(slug).pipe(
      map(blogs => (blogs && blogs.length > 0 ? blogs[0] : null)),
      switchMap(blog => {
        if (!blog) return of({ blog, products: [] as ProductCardModel[] });
        if (!blog.relatedProductIds?.length) return of({ blog, products: [] as ProductCardModel[] });
        
        return forkJoin(
          blog.relatedProductIds.map(id => 
            this.productService.getProductCardById(id).pipe(
              catchError(() => of(null))
            )
          )
        ).pipe(
          map(products => ({ 
            blog, 
            products: products.filter((p): p is ProductCardModel => p !== null) 
          }))
        );
      })
    ).subscribe({
      next: ({ blog, products }) => {
        this.blog.set(blog);
        this.relatedProducts.set(products);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  ngOnDestroy() {}
}
