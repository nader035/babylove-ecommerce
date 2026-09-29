import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTruckFast,
  faHeadset,
  faRotateLeft,
  faShieldHalved,
  faStar,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BlogService, Blog } from '../../../../core/services/blog.service';
import { CategoryService, CategoryCardModel } from '../../../../core/services/category.service';
import { HeroService, HeroSlide } from '../../../../core/services/hero.service';
import { ProductService, ProductCardModel } from '../../../../core/services/product.service';
import { TestimonialService, Testimonial } from '../../../../core/services/testimonial.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';
import { ProductCard } from '../../../../shared/components/product-card/product-card';
import { BodyExplorer } from '../../../../shared/components/body-explorer/body-explorer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, FontAwesomeModule, ProductCard, BodyExplorer],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  private translocoService = inject(TranslocoService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private blogService = inject(BlogService);
  private testimonialService = inject(TestimonialService);
  private heroService = inject(HeroService);
  private preferencesStore = inject(PreferencesStore);
  private testimonialIntervalId: ReturnType<typeof setInterval> | null = null;
  private heroIntervalId: ReturnType<typeof setInterval> | null = null;

  products = signal<ProductCardModel[]>([]);
  categoriesList = signal<CategoryCardModel[]>([]);
  recentBlogs = signal<Blog[]>([]);
  testimonials = signal<Testimonial[]>([]);
  heroSlides = signal<HeroSlide[]>([]);
  activeHero = signal(0);
  activeTestimonial = signal(0);

  icons = {
    truck: faTruckFast,
    headset: faHeadset,
    returnIcon: faRotateLeft,
    shield: faShieldHalved,
    star: faStar,
    arrow: faArrowRight,
  };

  featuredProducts = computed(() => this.products().slice(0, 5));
  activeLang = this.preferencesStore.language;
  currentHero = computed(() => this.heroSlides()[this.activeHero()] ?? null);

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => this.products.set(products));
    this.categoryService
      .getCategories()
      .subscribe((cats) => this.categoriesList.set(cats.slice(0, 6)));
    this.blogService.getBlogs().subscribe((blogs) => this.recentBlogs.set(blogs.slice(0, 3)));
    this.testimonialService.getTestimonials().subscribe((items) => this.testimonials.set(items));
    this.heroService.getActiveSlides().subscribe((slides) => {
      this.heroSlides.set(slides);
      this.activeHero.set(0);
    });

    this.translocoService.selectTranslation().subscribe(() => {
      setTimeout(() => {
        AOS.init({
          duration: 900,
          once: true,
          mirror: false,
          easing: 'ease-out-cubic',
        });
      }, 100);
    });

    this.testimonialIntervalId = setInterval(() => {
      const current = this.testimonials();
      if (current.length) {
        this.activeTestimonial.update((i) => (i + 1) % current.length);
      }
    }, 5000);

    this.heroIntervalId = setInterval(() => {
      const slides = this.heroSlides();
      if (slides.length > 1) {
        this.activeHero.update((index) => (index + 1) % slides.length);
      }
    }, 7000);
  }

  ngOnDestroy() {
    if (this.testimonialIntervalId) {
      clearInterval(this.testimonialIntervalId);
    }

    if (this.heroIntervalId) {
      clearInterval(this.heroIntervalId);
    }
  }

  setTestimonial(index: number) {
    this.activeTestimonial.set(index);
  }
}
