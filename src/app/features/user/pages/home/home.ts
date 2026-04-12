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
import {
  LookbookHotspot,
  LookbookService,
  LookbookModule,
} from '../../../../core/services/lookbook.service';
import { ProductService, ProductCardModel } from '../../../../core/services/product.service';
import { TestimonialService, Testimonial } from '../../../../core/services/testimonial.service';
import { PreferencesStore } from '../../../../core/stores/preferences.store';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

type HotspotVM = {
  id: string;
  top: number;
  left: number;
  label: string;
  type?: string;
  category?: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, FontAwesomeModule, ProductCard],
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
  private lookbookService = inject(LookbookService);
  private preferencesStore = inject(PreferencesStore);
  private testimonialIntervalId: ReturnType<typeof setInterval> | null = null;
  private heroIntervalId: ReturnType<typeof setInterval> | null = null;

  products = signal<ProductCardModel[]>([]);
  categoriesList = signal<CategoryCardModel[]>([]);
  recentBlogs = signal<Blog[]>([]);
  testimonials = signal<Testimonial[]>([]);
  heroSlides = signal<HeroSlide[]>([]);
  activeHero = signal(0);
  lookbook = signal<LookbookModule | null>(null);
  activeTestimonial = signal(0);
  hoveredHotspot = signal<number | null>(null);

  icons = {
    truck: faTruckFast,
    headset: faHeadset,
    returnIcon: faRotateLeft,
    shield: faShieldHalved,
    star: faStar,
    arrow: faArrowRight,
  };

  private readonly fallbackHotspots: HotspotVM[] = [
    { id: 'hs-fallback-1', top: 22, left: 10, label: 'Sweater', type: 'knitwear' },
    { id: 'hs-fallback-2', top: 68, left: 12, label: 'Trousers', type: 'separates' },
    { id: 'hs-fallback-3', top: 92, left: 48, label: 'Shoes', type: 'footwear' },
    { id: 'hs-fallback-4', top: 30, left: 52, label: 'Knitwear', type: 'knitwear' },
    { id: 'hs-fallback-5', top: 50, left: 43, label: 'Dresses', type: 'dresses' },
  ];

  featuredProducts = computed(() => this.products().slice(0, 5));
  activeLang = this.preferencesStore.language;
  currentHero = computed(() => this.heroSlides()[this.activeHero()] ?? null);
  lookbookImage = computed(() => this.lookbook()?.image || 'assets/images/interactive-models.svg');
  lookbookAlt = computed(() => this.lookbook()?.imageAlt || 'Premium Lookbook');
  lookbookCopy = computed(() => {
    const module = this.lookbook();
    const lang = this.activeLang();
    if (!module) {
      return null;
    }

    return lang === 'ar' ? module.ar : module.en;
  });
  hotspots = computed<HotspotVM[]>(() => {
    const module = this.lookbook();
    const lang = this.activeLang();

    if (!module?.hotspots?.length) {
      return this.fallbackHotspots;
    }

    return module.hotspots.map((spot: LookbookHotspot) => ({
      id: spot.id,
      top: spot.top,
      left: spot.left,
      label: lang === 'ar' ? spot.ar.label : spot.en.label,
      type: spot.productTypeFilter,
      category: spot.categoryFilter,
    }));
  });

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
    this.lookbookService.getActiveLookbook().subscribe((lookbook) => this.lookbook.set(lookbook));

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
