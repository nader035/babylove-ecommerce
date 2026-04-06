import { Component, ChangeDetectionStrategy, OnInit, computed, inject, signal } from '@angular/core';
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
import { ProductCardModel, ProductService } from '../../core/services/product.service';
import { CategoryCardModel, CategoryService } from '../../core/services/category.service';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { Blog, BlogService } from '../../core/services/blog.service';
import { Testimonial, TestimonialService } from '../../core/services/testimonial.service';
import { PreferencesStore } from '../../core/stores/preferences.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, FontAwesomeModule, ProductCard],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  private translocoService = inject(TranslocoService);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private blogService = inject(BlogService);
  private testimonialService = inject(TestimonialService);
  private preferencesStore = inject(PreferencesStore);

  products = signal<ProductCardModel[]>([]);
  categoriesList = signal<CategoryCardModel[]>([]);
  recentBlogs = signal<Blog[]>([]);
  testimonials = signal<Testimonial[]>([]);
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

  hotspots = [
    { top: 22, left: 10, label: 'home.look.man_sweater', type: 'sweater' },
    { top: 16, left: 20, label: 'home.look.man_turtleneck', type: 'sweater' },
    { top: 68, left: 12, label: 'home.look.man_trousers', type: 'pants' },
    { top: 91, left: 22, label: 'home.look.man_sneakers', type: 'sweater' },
    { top: 50, left: 43, label: 'home.look.woman_dress', type: 'dress' },
    { top: 30, left: 52, label: 'home.look.woman_cardigan', type: 'sweater' },
    { top: 92, left: 48, label: 'home.look.woman_shoes', type: 'shoes' },
    { top: 50, left: 65, label: 'home.look.boy_sweater', type: 'sweater' },
    { top: 76, left: 63, label: 'home.look.boy_pants', type: 'pants' },
    { top: 92, left: 62, label: 'home.look.boy_sneakers', type: 'sneakers' },
    { top: 63, left: 85, label: 'home.look.girl_dress', type: 'dress' },
    { top: 81, left: 92, label: 'home.look.girl_leggings', type: 'pants' },
    { top: 93, left: 84, label: 'home.look.girl_flats', type: 'shoes' },
  ];

  featuredProducts = computed(() => this.products().slice(0, 5));
  activeLang = this.preferencesStore.language;

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => this.products.set(products));
    this.categoryService.getCategories().subscribe((cats) => this.categoriesList.set(cats.slice(0, 6)));
    this.blogService.getBlogs().subscribe((blogs) => this.recentBlogs.set(blogs.slice(0, 3)));
    this.testimonialService.getTestimonials().subscribe((items) => this.testimonials.set(items));
    
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

    // Auto-rotate testimonials
    setInterval(() => {
      const current = this.testimonials();
      if (current.length) {
        this.activeTestimonial.update((i) => (i + 1) % current.length);
      }
    }, 5000);
  }

  setTestimonial(index: number) {
    this.activeTestimonial.set(index);
  }
}
