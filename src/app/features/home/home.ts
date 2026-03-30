import { Component, ChangeDetectionStrategy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTruck,
  faHeadset,
  faRotateLeft,
  faShieldHalved,
  faStar,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import AOS from 'aos';

import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ProductCardModel, ProductService } from '../../core/services/product.service';
import { CartStore } from '../../core/stores/cart.store';
import { WishlistStore } from '../../core/stores/wishlist.store';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, FontAwesomeModule],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private translocoService = inject(TranslocoService);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);

  products = signal<ProductCardModel[]>([]);
  activeTestimonial = signal(0);

  icons = {
    truck: faTruck,
    headset: faHeadset,
    returnIcon: faRotateLeft,
    shield: faShieldHalved,
    star: faStar,
    arrow: faArrowRight,
  };

  testimonials = [
    {
      quoteKey: 'home.testimonials.items.0.quote',
      authorKey: 'home.testimonials.items.0.author',
      roleKey: 'home.testimonials.items.0.role',
    },
    {
      quoteKey: 'home.testimonials.items.1.quote',
      authorKey: 'home.testimonials.items.1.author',
      roleKey: 'home.testimonials.items.1.role',
    },
    {
      quoteKey: 'home.testimonials.items.2.quote',
      authorKey: 'home.testimonials.items.2.author',
      roleKey: 'home.testimonials.items.2.role',
    },
  ];

  activeQuote = computed(() => this.testimonials[this.activeTestimonial()]);
  featuredProducts = computed(() => this.products().slice(0, 8));
  newArrivals = computed(() => this.products().slice(0, 4));

  categories = [
    { key: 'newborn', icon: '👶', route: '/shop', query: 'newborn' },
    { key: 'toddler_boys', icon: '👦', route: '/shop', query: 'boy' },
    { key: 'toddler_girls', icon: '👧', route: '/shop', query: 'girl' },
    { key: 'accessories', icon: '🎀', route: '/shop', query: 'gear' },
  ];

  setTestimonial(index: number) {
    this.activeTestimonial.set(index);
  }

  addToCart(product: ProductCardModel) {
    this.cartStore.addToCart(product);
    this.notificationService.success(`${product.title} added to cart!`);
  }

  ngOnInit() {
    this.productService.getProducts().subscribe((products) => this.products.set(products));
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
      this.activeTestimonial.update((i) => (i + 1) % this.testimonials.length);
    }, 5000);
  }
}
