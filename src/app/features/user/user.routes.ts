import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const userRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../user/pages/home/home').then((m) => m.HomeComponent),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('../user/pages/categories/pages/category-list/category-list').then((m) => m.CategoryList),
  },
  {
    path: 'shop',
    loadComponent: () => import('../user/pages/shop/pages/shop-page/shop-page').then((m) => m.ShopPage),
  },
  {
    path: 'product/:slug',
    loadComponent: () =>
      import('../user/pages/shop/pages/product-detail-page/product-detail-page').then(
        (m) => m.ProductDetailPage,
      ),
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('../user/pages/wishlist/pages/wishlist-page/wishlist-page').then((m) => m.WishlistPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('../user/pages/cart/pages/cart-page/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../user/pages/checkout/pages/checkout-page/checkout-page').then((m) => m.CheckoutPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../user/pages/profile/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../user/pages/orders/orders-page').then((m) => m.OrdersPage),
  },
  {
    path: 'blog',
    loadComponent: () => import('../user/pages/blog/blog-page').then((m) => m.BlogPage),
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('../user/pages/blog/blog-detail/blog-detail').then((m) => m.BlogDetail),
  },
  {
    path: 'about us',
    loadComponent: () =>
      import('../user/pages/about/about-page').then((m) => m.AboutPage),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('../user/pages/settings/settings-page').then((m) => m.SettingsPage),
  },
];
