import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faStar,
  faStarHalfStroke,
  faHeart,
  faMinus,
  faPlus,
  faChevronRight,
  faTruck,
  faShieldHalved,
  faRotateLeft,
  faRulerCombined,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty, faHeart as faHeartEmpty } from '@fortawesome/free-regular-svg-icons';
import { Product, Sku } from '../../../../core/models/icatalog';
import { ProductCardModel, ProductService } from '../../../../core/services/product.service';
import { CartStore } from '../../../../core/stores/cart.store';
import { WishlistStore } from '../../../../core/stores/wishlist.store';
import { NotificationService } from '../../../../core/services/notification.service';
import { SkeletonLoader } from '../../../../shared/components/skeleton-loader/skeleton-loader';
import { PreferencesStore } from '../../../../core/stores/preferences.store';
import { ProductCard } from '../../../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, TranslocoModule, RouterLink, FontAwesomeModule, SkeletonLoader, ProductCard],
  templateUrl: './product-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private notificationService = inject(NotificationService);
  private preferencesStore = inject(PreferencesStore);
  cartStore = inject(CartStore);
  wishlistStore = inject(WishlistStore);

  product = signal<Product | null>(null);
  relatedProducts = signal<ProductCardModel[]>([]);
  isLoading = signal(true);
  selectedSku = signal<Sku | null>(null);
  selectedImageIndex = signal(0);
  quantity = signal(1);
  addedToCart = signal(false);
  activeTab = signal<'description' | 'reviews'>('description');
  showSizeGuide = signal(false);

  activeLang = computed(() => this.preferencesStore.language());

  icons = {
    star: faStar,
    starHalf: faStarHalfStroke,
    starEmpty: faStarEmpty,
    heartFilled: faHeart,
    heartEmpty: faHeartEmpty,
    minus: faMinus,
    plus: faPlus,
    chevronRight: faChevronRight,
    truck: faTruck,
    shield: faShieldHalved,
    returnIcon: faRotateLeft,
    ruler: faRulerCombined,
    close: faTimes,
  };

  sizeGuideData = [
    { size: 'XS', chest: '84-88', waist: '64-68', hip: '88-92' },
    { size: 'S', chest: '88-92', waist: '68-72', hip: '92-96' },
    { size: 'M', chest: '92-96', waist: '72-76', hip: '96-100' },
    { size: 'L', chest: '96-102', waist: '76-82', hip: '100-106' },
    { size: 'XL', chest: '102-108', waist: '82-88', hip: '106-112' },
  ];

  currentPrice = computed(() => {
    const sku = this.selectedSku();
    return sku ? sku.price : (this.product()?.skus?.[0]?.price ?? 0);
  });

  allImages = computed(() => {
    const p = this.product();
    if (!p) return [];
    const imgs: string[] = [];
    if (p.thumbnail) imgs.push(p.thumbnail);
    if (p.images) imgs.push(...p.images.filter((img) => img !== p.thumbnail));
    p.skus?.forEach((sku) => {
      sku.images?.forEach((si) => {
        if (!imgs.includes(si.image)) imgs.push(si.image);
      });
    });
    return imgs.length ? imgs : ['assets/images/hero-model.jpg'];
  });

  currentImage = computed(() => this.allImages()[this.selectedImageIndex()] ?? '');

  avgRating = computed(() => {
    const reviews = this.product()?.reviews ?? [];
    if (!reviews.length) return 0;
    return reviews.reduce((s, r) => s + r.rate, 0) / reviews.length;
  });

  isInWishlist = computed(() => {
    const p = this.product();
    return p ? this.wishlistStore.ids().has(p.id) : false;
  });

  cardModel = computed((): ProductCardModel | null => {
    const p = this.product();
    if (!p) return null;
    return {
      id: p.id,
      slug: p.slug,
      image: p.thumbnail || 'assets/images/hero-model.jpg',
      categorySlug: p.category?.slug ?? 'all',
      categoryTitle: p.category?.[this.activeLang()]?.title ?? 'Premium',
      price: this.currentPrice(),
      rating: Number(this.avgRating().toFixed(1)),
      reviewCount: p.reviews?.length ?? 0,
      type: p.type,
      en: {
        title: p.en.title,
        shortDescription: p.en.shortDescription,
      },
      ar: {
        title: p.ar.title,
        shortDescription: p.ar.shortDescription,
      }
    };
  });

  // Extract unique sizes and colors from SKUs
  availableSizes = computed(() => {
    const skus = this.product()?.skus ?? [];
    const sizes = new Set<string>();
    skus.forEach(sku => {
      const parts = sku.code.split(' · ');
      if (parts[0]) sizes.add(parts[0].trim());
    });
    return [...sizes];
  });

  availableColors = computed(() => {
    const skus = this.product()?.skus ?? [];
    const colors = new Set<string>();
    skus.forEach(sku => {
      const parts = sku.code.split(' · ');
      if (parts[1]) colors.add(parts[1].trim());
    });
    return [...colors];
  });

  selectedSize = signal('');
  selectedColor = signal('');

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) {
        this._loadProductBySlug(slug);
      }
    });
  }

  selectSku(sku: Sku) {
    this.selectedSku.set(sku);
    const parts = sku.code.split(' · ');
    if (parts[0]) this.selectedSize.set(parts[0].trim());
    if (parts[1]) this.selectedColor.set(parts[1].trim());
    const skuImage = sku.images?.[0]?.image;
    if (skuImage) {
      const idx = this.allImages().indexOf(skuImage);
      if (idx !== -1) this.selectedImageIndex.set(idx);
    }
  }

  selectByVariant(size: string, color: string) {
    this.selectedSize.set(size);
    this.selectedColor.set(color);
    const match = this.product()?.skus?.find(s => {
      const parts = s.code.split(' · ');
      return parts[0]?.trim() === size && parts[1]?.trim() === color;
    });
    if (match) this.selectSku(match);
  }

  selectSize(size: string) {
    const color = this.selectedColor() || this.availableColors()[0];
    this.selectByVariant(size, color);
  }

  selectColor(color: string) {
    const size = this.selectedSize() || this.availableSizes()[0];
    this.selectByVariant(size, color);
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
  }

  incrementQty() {
    this.quantity.update((q) => q + 1);
  }

  decrementQty() {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  addToCart() {
    const card = this.cardModel();
    if (!card) return;
    for (let i = 0; i < this.quantity(); i++) {
      this.cartStore.addToCart(card);
    }
    this.addedToCart.set(true);
    const lang = this.activeLang();
    const title = card[lang]?.title;
    this.notificationService.success(`${title} added to bag!`);
    setTimeout(() => this.addedToCart.set(false), 1800);
  }

  toggleWishlist() {
    const card = this.cardModel();
    if (!card) return;
    this.wishlistStore.toggle(card);
    const action = this.isInWishlist() ? 'removed from' : 'added to';
    const lang = this.activeLang();
    const title = card[lang]?.title;
    this.notificationService.info(`${title} ${action} wishlist`);
  }

  getStars(rating: number): ('full' | 'half' | 'empty')[] {
    const stars: ('full' | 'half' | 'empty')[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) stars.push('full');
      else if (rating >= i - 0.5) stars.push('half');
      else stars.push('empty');
    }
    return stars;
  }

  private _loadProductBySlug(slug: string) {
    this.isLoading.set(true);
    this.productService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        if (product.skus?.length) {
          this.selectSku(product.skus[0]);
        }
        this.isLoading.set(false);

        if (product.categoryId) {
          this.productService
            .getRelatedProducts(product.categoryId, product.id)
            .subscribe((related) => this.relatedProducts.set(related));
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notificationService.error('Failed to load product details.');
      },
    });
  }
}
