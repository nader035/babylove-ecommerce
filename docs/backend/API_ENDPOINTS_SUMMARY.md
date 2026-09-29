# BabyLove API endpoint summary

Production endpoint inventory derived from the Angular storefront. All paths are versioned, RESTful contracts. Exact request/response rules, ownership, validation, error handling, examples, and frontend file references are in [API_ENDPOINTS.md](API_ENDPOINTS.md).

**Total operations:** 260. A public-or-customer entry exposes anonymous baseline results and uses personalization only with a Bearer token. N/A frontend references are required production administration/provider operations with no current Angular admin screen.

| Module | Method | Endpoint | Auth | Roles | Description | Frontend Reference |
| ------ | ------ | -------- | ---- | ----- | ----------- | ------------------ |
| Authentication | POST | /api/v1/auth/register | Public | public | Register a customer account | FR-AUTH-REGISTER |
| Authentication | POST | /api/v1/auth/login | Public | public | Authenticate customer credentials | FR-AUTH-LOGIN |
| Authentication | POST | /api/v1/auth/logout | Customer | customer | Revoke current session | FR-AUTH-LOGOUT |
| Authentication | POST | /api/v1/auth/refresh | Public | refresh-token | Rotate access and refresh tokens | FR-AUTH-SESSION |
| Authentication | GET | /api/v1/auth/session | Customer | customer | Get current authenticated session | FR-AUTH-SESSION |
| Authentication | POST | /api/v1/auth/verify-email | Public | public | Verify email token | FR-AUTH-REGISTER |
| Authentication | POST | /api/v1/auth/resend-verification | Public | public | Resend email verification | FR-AUTH-REGISTER |
| Authentication | POST | /api/v1/auth/forgot-password | Public | public | Request password reset | FR-AUTH-FORGOT |
| Authentication | POST | /api/v1/auth/reset-password | Public | public | Reset password with token | FR-AUTH-FORGOT |
| Authentication | POST | /api/v1/auth/change-password | Customer | customer | Change own password | FR-SETTINGS |
| Authentication | GET | /api/v1/auth/sessions | Customer | customer | List own sessions | FR-SETTINGS |
| Authentication | DELETE | /api/v1/auth/sessions/{sessionId} | Customer | customer | Revoke one own session | FR-SETTINGS |
| Users | GET | /api/v1/me | Customer | customer | Get own profile | FR-PROFILE |
| Users | PATCH | /api/v1/me | Customer | customer | Update own profile | FR-PROFILE |
| Users | POST | /api/v1/me/avatar | Customer | customer | Attach avatar media | FR-PROFILE-AVATAR |
| Users | DELETE | /api/v1/me/avatar | Customer | customer | Delete own avatar | FR-PROFILE-AVATAR |
| Users | PATCH | /api/v1/me/preferences | Customer | customer | Update preferences | FR-SETTINGS |
| Users | PATCH | /api/v1/me/notification-preferences | Customer | customer | Update notification preferences | FR-SETTINGS |
| Users | DELETE | /api/v1/me | Customer | customer | Delete own account | FR-SETTINGS |
| Addresses | GET | /api/v1/me/addresses | Customer | customer | List own addresses | FR-PROFILE |
| Addresses | POST | /api/v1/me/addresses | Customer | customer | Create address | FR-CHECKOUT |
| Addresses | GET | /api/v1/me/addresses/{addressId} | Customer | customer | Get own address | FR-PROFILE |
| Addresses | PATCH | /api/v1/me/addresses/{addressId} | Customer | customer | Update own address | FR-PROFILE |
| Addresses | DELETE | /api/v1/me/addresses/{addressId} | Customer | customer | Delete own address | FR-PROFILE |
| Addresses | POST | /api/v1/me/addresses/{addressId}/default-shipping | Customer | customer | Set default shipping address | FR-CHECKOUT |
| Addresses | POST | /api/v1/me/addresses/{addressId}/default-billing | Customer | customer | Set default billing address | FR-CHECKOUT |
| Products | GET | /api/v1/products | Public | public | List, search, filter, sort and paginate products | FR-SHOP |
| Products | GET | /api/v1/products/filter-metadata | Public | public | Get product filter facets and price bounds | FR-SHOP |
| Products | GET | /api/v1/products/suggestions | Public | public | Get product autocomplete suggestions | FR-HEADER-SEARCH |
| Products | GET | /api/v1/products/{productId} | Public | public | Get product details | FR-PRODUCT-DETAIL |
| Products | GET | /api/v1/products/{productId}/variants | Public | public | Get sellable product variants | FR-PRODUCT-DETAIL |
| Products | GET | /api/v1/products/{productId}/images | Public | public | Get product images | FR-PRODUCT-DETAIL |
| Products | GET | /api/v1/products/{productId}/availability | Public | public | Get product availability | FR-PRODUCT-DETAIL |
| Products | GET | /api/v1/products/{productId}/related | Public | public | Get related products | FR-PRODUCT-DETAIL |
| Products | GET | /api/v1/products/{productId}/similar | Public | public | Get similar products | FR-PRODUCT-DETAIL |
| Products | GET | /api/v1/products/recommendations | Public/Customer | public\|customer | Get contextual recommendations | FR-HOME |
| Categories | GET | /api/v1/categories | Public | public | List active categories | FR-CATEGORIES |
| Categories | GET | /api/v1/categories/{categoryId} | Public | public | Get category detail | FR-CATEGORIES |
| Categories | GET | /api/v1/categories/{categoryId}/subcategories | Public | public | List category subcategories | FR-CATEGORIES |
| Brands | GET | /api/v1/brands | Public | public | List active brands | FR-SHOP |
| Brands | GET | /api/v1/brands/{brandId} | Public | public | Get brand detail | FR-SHOP |
| Collections | GET | /api/v1/collections | Public | public | List active collections | FR-HOME |
| Collections | GET | /api/v1/collections/{collectionId} | Public | public | Get collection detail | FR-HOME |
| Home | GET | /api/v1/home | Public | public | Get configured home page | FR-HOME |
| Home | GET | /api/v1/home/sections | Public | public | Get active home sections | FR-HOME |
| Home | GET | /api/v1/heroes | Public | public | Get active hero slides | FR-HERO |
| Home | GET | /api/v1/banners | Public | public | Get active promotional banners | FR-HOME |
| Home | GET | /api/v1/lookbooks | Public | public | Get active lookbooks and hotspots | FR-LOOKBOOK |
| Home | GET | /api/v1/testimonials | Public | public | Get active testimonials | FR-HOME |
| Content | GET | /api/v1/blog-posts | Public | public | List published editorial posts | FR-BLOG |
| Content | GET | /api/v1/blog-posts/{slug} | Public | public | Get published editorial post | FR-BLOG-DETAIL |
| Newsletter | POST | /api/v1/newsletter-subscriptions | Public | public | Subscribe to newsletter | FR-NEWSLETTER |
| Body zones | GET | /api/v1/body-zones | Public | public | List active Shop-by-Body-Part zones | FR-BODY-ZONE |
| Body zones | GET | /api/v1/body-zones/{bodyZoneSlug} | Public | public | Get body-zone details and labels | FR-BODY-ZONE |
| Body zones | GET | /api/v1/body-zones/{bodyZoneSlug}/hotspot | Public | public | Get body-zone hotspot configuration | FR-BODY-ZONE |
| Body zones | GET | /api/v1/body-zones/{bodyZoneSlug}/category-mappings | Public | public | Get body-zone category mappings | FR-BODY-ZONE |
| Wishlist | GET | /api/v1/wishlist | Customer | customer | Get own wishlist | FR-WISHLIST |
| Wishlist | POST | /api/v1/wishlist/items | Customer | customer | Add product or variant to wishlist | FR-WISHLIST |
| Wishlist | GET | /api/v1/wishlist/items/check | Customer | customer | Check saved state | FR-PRODUCT-DETAIL |
| Wishlist | DELETE | /api/v1/wishlist/items/{wishlistItemId} | Customer | customer | Remove wishlist item | FR-WISHLIST |
| Wishlist | DELETE | /api/v1/wishlist/items | Customer | customer | Clear wishlist | FR-WISHLIST |
| Wishlist | POST | /api/v1/wishlist/items/{wishlistItemId}/move-to-cart | Customer | customer | Move wishlist item to cart | FR-WISHLIST |
| Cart | GET | /api/v1/cart | Customer/Guest | customer\|guest-cart | Get current cart and totals | FR-CART |
| Cart | POST | /api/v1/cart/items | Customer/Guest | customer\|guest-cart | Add cart item | FR-CART |
| Cart | PATCH | /api/v1/cart/items/{cartItemId} | Customer/Guest | customer\|guest-cart | Update cart item quantity | FR-CART |
| Cart | DELETE | /api/v1/cart/items/{cartItemId} | Customer/Guest | customer\|guest-cart | Remove cart item | FR-CART |
| Cart | DELETE | /api/v1/cart/items | Customer/Guest | customer\|guest-cart | Clear cart | FR-CART |
| Cart | POST | /api/v1/cart/validate | Customer/Guest | customer\|guest-cart | Validate cart pricing and availability | FR-CART |
| Cart | POST | /api/v1/cart/merge | Customer | customer | Merge guest cart after login | FR-AUTH-LOGIN |
| Cart | POST | /api/v1/cart/coupon | Customer/Guest | customer\|guest-cart | Apply cart coupon | FR-CART |
| Cart | DELETE | /api/v1/cart/coupon | Customer/Guest | customer\|guest-cart | Remove cart coupon | FR-CART |
| Coupons | POST | /api/v1/coupons/validate | Customer/Guest | customer\|guest-cart | Validate coupon | FR-CART |
| Promotions | GET | /api/v1/promotions | Public/Customer | public\|customer | List applicable promotions | FR-HOME |
| Checkout | POST | /api/v1/checkout | Customer | customer | Initialize checkout and reservation | FR-CHECKOUT |
| Checkout | GET | /api/v1/checkout/{checkoutId} | Customer | customer | Get checkout state | FR-CHECKOUT |
| Checkout | POST | /api/v1/checkout/{checkoutId}/validate | Customer | customer | Validate checkout | FR-CHECKOUT |
| Checkout | GET | /api/v1/checkout/{checkoutId}/preview | Customer | customer | Get order preview | FR-CHECKOUT |
| Checkout | GET | /api/v1/checkout/{checkoutId}/shipping-methods | Customer | customer | Get checkout shipping methods | FR-CHECKOUT |
| Checkout | POST | /api/v1/checkout/{checkoutId}/shipping-method | Customer | customer | Select shipping method | FR-CHECKOUT |
| Checkout | GET | /api/v1/checkout/{checkoutId}/payment-methods | Customer | customer | Get checkout payment methods | FR-CHECKOUT |
| Checkout | POST | /api/v1/checkout/{checkoutId}/payments | Customer | customer | Initialize payment attempt | FR-CHECKOUT |
| Checkout | POST | /api/v1/checkout/{checkoutId}/place-order | Customer | customer | Place order idempotently | FR-CHECKOUT |
| Payments | GET | /api/v1/payments/{paymentId} | Customer | customer | Get own payment status | FR-CHECKOUT |
| Payments | POST | /api/v1/payments/{paymentId}/verify | Customer | customer | Verify payment | FR-CHECKOUT |
| Payments | POST | /api/v1/payments/{paymentId}/retry | Customer | customer | Retry failed payment | FR-CHECKOUT |
| Payments | GET | /api/v1/payments/methods | Public/Customer | public\|customer | Get available payment methods | FR-CHECKOUT |
| Payments | GET | /api/v1/payments/callback/{provider} | Public | provider-state | Handle provider callback | FR-CHECKOUT |
| Payments | POST | /api/v1/webhooks/payments/{provider} | Provider | provider-signature | Receive provider payment webhook | N/A |
| Shipping | GET | /api/v1/shipping/methods | Public | public | Get indicative shipping methods | FR-CHECKOUT |
| Shipping | POST | /api/v1/shipping/rates | Customer/Guest | customer\|guest-cart | Calculate shipping rates | FR-CHECKOUT |
| Shipping | GET | /api/v1/shipments/{shipmentId} | Customer | customer | Get own shipment | FR-ORDERS |
| Shipping | GET | /api/v1/shipments/{shipmentId}/tracking | Customer | customer | Get own shipment tracking | FR-ORDERS |
| Orders | GET | /api/v1/orders | Customer | customer | List own orders | FR-ORDERS |
| Orders | GET | /api/v1/orders/{orderId} | Customer | customer | Get own order | FR-ORDERS |
| Orders | POST | /api/v1/orders/{orderId}/cancel | Customer | customer | Cancel eligible order | FR-ORDERS |
| Orders | POST | /api/v1/orders/{orderId}/returns | Customer | customer | Request return | FR-ORDERS |
| Orders | GET | /api/v1/orders/{orderId}/refunds | Customer | customer | Get refund status | FR-ORDERS |
| Orders | POST | /api/v1/orders/{orderId}/reorder | Customer | customer | Reorder items to cart | FR-ORDERS |
| Orders | GET | /api/v1/orders/{orderId}/invoice | Customer | customer | Download invoice | FR-ORDERS |
| Reviews | GET | /api/v1/products/{productId}/reviews | Public | public | List approved reviews | FR-PRODUCT-DETAIL |
| Reviews | GET | /api/v1/products/{productId}/rating-summary | Public | public | Get rating summary | FR-PRODUCT-DETAIL |
| Reviews | POST | /api/v1/products/{productId}/reviews | Customer | customer | Create product review | FR-PRODUCT-DETAIL |
| Reviews | PATCH | /api/v1/reviews/{reviewId} | Customer | customer | Update own review | FR-PRODUCT-DETAIL |
| Reviews | DELETE | /api/v1/reviews/{reviewId} | Customer | customer | Delete own review | FR-PRODUCT-DETAIL |
| Reviews | POST | /api/v1/reviews/{reviewId}/images | Customer | customer | Attach review images | FR-PRODUCT-DETAIL |
| Reviews | POST | /api/v1/reviews/{reviewId}/helpful | Customer | customer | Mark review helpful | FR-PRODUCT-DETAIL |
| Notifications | GET | /api/v1/notifications | Customer | customer | List own notifications | FR-SETTINGS |
| Notifications | GET | /api/v1/notifications/unread-count | Customer | customer | Get unread notification count | FR-HEADER |
| Notifications | POST | /api/v1/notifications/{notificationId}/read | Customer | customer | Mark notification read | FR-SETTINGS |
| Notifications | POST | /api/v1/notifications/read-all | Customer | customer | Mark all notifications read | FR-SETTINGS |
| Notifications | DELETE | /api/v1/notifications/{notificationId} | Customer | customer | Delete notification | FR-SETTINGS |
| Notifications | DELETE | /api/v1/notifications | Customer | customer | Clear notifications | FR-SETTINGS |
| Recently viewed | GET | /api/v1/recently-viewed | Customer | customer | List own recently viewed products | FR-RECENT |
| Recently viewed | POST | /api/v1/recently-viewed | Customer | customer | Track product view | FR-PRODUCT-DETAIL |
| Recently viewed | DELETE | /api/v1/recently-viewed/{productId} | Customer | customer | Remove recently viewed product | FR-RECENT |
| Recently viewed | DELETE | /api/v1/recently-viewed | Customer | customer | Clear recently viewed history | FR-RECENT |
| Saved Wardrobe | GET | /api/v1/wardrobe | Customer | customer | List own private wardrobe | FR-WARDROBE |
| Saved Wardrobe | GET | /api/v1/wardrobe/{wardrobeItemId} | Customer | customer | Get own wardrobe item | FR-WARDROBE |
| Saved Wardrobe | POST | /api/v1/wardrobe/items | Customer | customer | Save store product or variant | FR-WARDROBE-SAVE |
| Saved Wardrobe | POST | /api/v1/wardrobe/uploads | Customer | customer | Create wardrobe item from media | FR-WARDROBE-UPLOAD |
| Saved Wardrobe | PATCH | /api/v1/wardrobe/{wardrobeItemId} | Customer | customer | Update wardrobe metadata | FR-WARDROBE |
| Saved Wardrobe | DELETE | /api/v1/wardrobe/{wardrobeItemId} | Customer | customer | Delete wardrobe item | FR-WARDROBE |
| Saved Wardrobe | DELETE | /api/v1/wardrobe/items/product | Customer | customer | Remove saved store product | FR-WARDROBE-SAVE |
| Saved Wardrobe | GET | /api/v1/wardrobe/items/check | Customer | customer | Check saved wardrobe product | FR-WARDROBE-SAVE |
| Saved Wardrobe | GET | /api/v1/wardrobe/tags | Customer | customer | List own wardrobe tags | FR-WARDROBE |
| Saved Wardrobe | PUT | /api/v1/wardrobe/tags/{tag} | Customer | customer | Rename or merge wardrobe tag | FR-WARDROBE |
| Saved Wardrobe | GET | /api/v1/wardrobe/media/{mediaId}/url | Customer | customer | Get private wardrobe media URL | FR-WARDROBE |
| Saved Wardrobe | DELETE | /api/v1/wardrobe/media/{mediaId} | Customer | customer | Delete own wardrobe media | FR-WARDROBE-UPLOAD |
| Media | POST | /api/v1/media/uploads | Customer/Admin | uploader | Initiate direct media upload | FR-WARDROBE-UPLOAD |
| Media | POST | /api/v1/media/uploads/{mediaId}/complete | Customer/Admin | uploader | Complete media upload | FR-WARDROBE-UPLOAD |
| Media | POST | /api/v1/media/uploads/{mediaId}/cancel | Customer/Admin | uploader | Cancel media upload | FR-WARDROBE-UPLOAD |
| Media | GET | /api/v1/media/{mediaId} | Public/Owner/Admin | scope-based | Get media metadata or public URL | FR-PRODUCT-DETAIL |
| Media | GET | /api/v1/media/{mediaId}/signed-url | Customer/Admin | owner\|manager | Get private signed media URL | FR-WARDROBE |
| Media | DELETE | /api/v1/media/{mediaId} | Customer/Admin | owner\|manager | Delete media | FR-WARDROBE-UPLOAD |
| Admin dashboard | GET | /api/v1/admin/dashboard/summary | Admin | admin\|manager | Get dashboard summary | N/A |
| Admin dashboard | GET | /api/v1/admin/dashboard/sales | Admin | admin\|manager | Get sales report | N/A |
| Admin users | GET | /api/v1/admin/users | Admin | admin\|support | List users | N/A |
| Admin users | GET | /api/v1/admin/users/{userId} | Admin | admin\|support | Get user details | N/A |
| Admin users | PATCH | /api/v1/admin/users/{userId} | Admin | admin | Update user status or role | N/A |
| Admin products | GET | /api/v1/admin/products | Admin | catalog_manager | List all products including drafts | N/A |
| Admin products | POST | /api/v1/admin/products | Admin | catalog_manager | Create product | N/A |
| Admin products | GET | /api/v1/admin/products/{productId} | Admin | catalog_manager | Get product administration detail | N/A |
| Admin products | PATCH | /api/v1/admin/products/{productId} | Admin | catalog_manager | Update product | N/A |
| Admin products | POST | /api/v1/admin/products/{productId}/archive | Admin | catalog_manager | Archive or unarchive product | N/A |
| Admin products | POST | /api/v1/admin/products/{productId}/images | Admin | catalog_manager | Attach product image | N/A |
| Admin products | PATCH | /api/v1/admin/products/{productId}/images/{imageId} | Admin | catalog_manager | Update product image | N/A |
| Admin products | DELETE | /api/v1/admin/products/{productId}/images/{imageId} | Admin | catalog_manager | Remove product image | N/A |
| Admin variants | POST | /api/v1/admin/products/{productId}/variants | Admin | catalog_manager | Create variant | N/A |
| Admin variants | PATCH | /api/v1/admin/products/{productId}/variants/{variantId} | Admin | catalog_manager | Update variant | N/A |
| Admin variants | DELETE | /api/v1/admin/products/{productId}/variants/{variantId} | Admin | catalog_manager | Archive variant | N/A |
| Admin inventory | GET | /api/v1/admin/products/{productId}/variants/{variantId}/inventory | Admin | catalog_manager\|fulfillment_manager | Get variant inventory | N/A |
| Admin inventory | PATCH | /api/v1/admin/inventory/{variantId} | Admin | fulfillment_manager | Set stock quantity | N/A |
| Admin inventory | POST | /api/v1/admin/inventory/{variantId}/adjustments | Admin | fulfillment_manager | Adjust stock | N/A |
| Admin inventory | GET | /api/v1/admin/inventory/{variantId}/history | Admin | fulfillment_manager | Get inventory history | N/A |
| Admin inventory | GET | /api/v1/admin/inventory/low-stock | Admin | catalog_manager\|fulfillment_manager | List low stock variants | N/A |
| Admin inventory | POST | /api/v1/admin/inventory/reservations | Admin | fulfillment_manager | Reserve stock | N/A |
| Admin inventory | POST | /api/v1/admin/inventory/reservations/{reservationId}/release | Admin | fulfillment_manager | Release stock reservation | N/A |
| Admin inventory | POST | /api/v1/admin/inventory/restore | Admin | fulfillment_manager | Restore stock after cancellation/return | N/A |
| Admin categories | GET | /api/v1/admin/categories | Admin | catalog_manager | List categories | N/A |
| Admin categories | POST | /api/v1/admin/categories | Admin | catalog_manager | Create category | N/A |
| Admin categories | PATCH | /api/v1/admin/categories/{categoryId} | Admin | catalog_manager | Update category | N/A |
| Admin categories | DELETE | /api/v1/admin/categories/{categoryId} | Admin | catalog_manager | Archive or delete category | N/A |
| Admin categories | POST | /api/v1/admin/categories/reorder | Admin | catalog_manager | Reorder categories | N/A |
| Admin categories | POST | /api/v1/admin/categories/{categoryId}/activation | Admin | catalog_manager | Activate or deactivate category | N/A |
| Admin brands | GET | /api/v1/admin/brands | Admin | catalog_manager | List brands | N/A |
| Admin brands | POST | /api/v1/admin/brands | Admin | catalog_manager | Create brand | N/A |
| Admin brands | GET | /api/v1/admin/brands/{brandId} | Admin | catalog_manager | Get brand | N/A |
| Admin brands | PATCH | /api/v1/admin/brands/{brandId} | Admin | catalog_manager | Update brand | N/A |
| Admin brands | DELETE | /api/v1/admin/brands/{brandId} | Admin | catalog_manager | Delete brand | N/A |
| Admin brands | POST | /api/v1/admin/brands/reorder | Admin | catalog_manager | Reorder brands | N/A |
| Admin brands | POST | /api/v1/admin/brands/{brandId}/activation | Admin | catalog_manager | Activate or deactivate brand | N/A |
| Admin collections | GET | /api/v1/admin/collections | Admin | catalog_manager\|marketing_manager | List collections | N/A |
| Admin collections | POST | /api/v1/admin/collections | Admin | catalog_manager\|marketing_manager | Create collection | N/A |
| Admin collections | GET | /api/v1/admin/collections/{collectionId} | Admin | catalog_manager\|marketing_manager | Get collection | N/A |
| Admin collections | PATCH | /api/v1/admin/collections/{collectionId} | Admin | catalog_manager\|marketing_manager | Update collection | N/A |
| Admin collections | DELETE | /api/v1/admin/collections/{collectionId} | Admin | catalog_manager\|marketing_manager | Delete collection | N/A |
| Admin collections | POST | /api/v1/admin/collections/reorder | Admin | catalog_manager\|marketing_manager | Reorder collections | N/A |
| Admin collections | POST | /api/v1/admin/collections/{collectionId}/activation | Admin | catalog_manager\|marketing_manager | Activate or deactivate collection | N/A |
| Admin orders | GET | /api/v1/admin/orders | Admin | support\|fulfillment_manager | List orders | N/A |
| Admin orders | GET | /api/v1/admin/orders/{orderId} | Admin | support\|fulfillment_manager | Get order detail | N/A |
| Admin orders | PATCH | /api/v1/admin/orders/{orderId}/status | Admin | fulfillment_manager | Update order status | N/A |
| Admin orders | PATCH | /api/v1/admin/orders/{orderId}/payment-status | Admin | admin\|support | Update payment status | N/A |
| Admin orders | PATCH | /api/v1/admin/orders/{orderId}/fulfillment-status | Admin | fulfillment_manager | Update fulfillment status | N/A |
| Admin orders | POST | /api/v1/admin/orders/{orderId}/notes | Admin | support\|fulfillment_manager | Add internal order note | N/A |
| Admin payments | POST | /api/v1/admin/payments/{paymentId}/refunds | Admin | admin\|support | Refund payment | N/A |
| Admin payments | GET | /api/v1/admin/payments | Admin | admin\|support | List payments | N/A |
| Admin payments | PATCH | /api/v1/admin/payment-methods/{methodCode} | Admin | admin | Configure payment method | N/A |
| Admin shipping zones | GET | /api/v1/admin/shipping/zones | Admin | admin\|fulfillment_manager | List shipping zones | N/A |
| Admin shipping zones | POST | /api/v1/admin/shipping/zones | Admin | admin\|fulfillment_manager | Create shipping zone | N/A |
| Admin shipping zones | PATCH | /api/v1/admin/shipping/zones/{zoneId} | Admin | admin\|fulfillment_manager | Update shipping zone | N/A |
| Admin shipping zones | DELETE | /api/v1/admin/shipping/zones/{zoneId} | Admin | admin\|fulfillment_manager | Delete shipping zone | N/A |
| Admin shipping methods | GET | /api/v1/admin/shipping-methods | Admin | admin\|fulfillment_manager | List shipping methods | N/A |
| Admin shipping methods | POST | /api/v1/admin/shipping-methods | Admin | admin\|fulfillment_manager | Create shipping method | N/A |
| Admin shipping methods | PATCH | /api/v1/admin/shipping-methods/{shippingMethodId} | Admin | admin\|fulfillment_manager | Update shipping method | N/A |
| Admin shipping methods | DELETE | /api/v1/admin/shipping-methods/{shippingMethodId} | Admin | admin\|fulfillment_manager | Delete shipping method | N/A |
| Admin shipments | GET | /api/v1/admin/shipments | Admin | fulfillment_manager | List shipments | N/A |
| Admin shipments | PATCH | /api/v1/admin/shipments/{shipmentId} | Admin | fulfillment_manager | Update shipment tracking | N/A |
| Admin coupons | GET | /api/v1/admin/coupons | Admin | marketing_manager | List coupons | N/A |
| Admin coupons | POST | /api/v1/admin/coupons | Admin | marketing_manager | Create coupon | N/A |
| Admin coupons | GET | /api/v1/admin/coupons/{couponId} | Admin | marketing_manager | Get coupon | N/A |
| Admin coupons | PATCH | /api/v1/admin/coupons/{couponId} | Admin | marketing_manager | Update coupon | N/A |
| Admin coupons | DELETE | /api/v1/admin/coupons/{couponId} | Admin | marketing_manager | Delete coupon | N/A |
| Admin coupons | POST | /api/v1/admin/coupons/{couponId}/activation | Admin | marketing_manager | Activate or deactivate coupon | N/A |
| Admin promotions | GET | /api/v1/admin/promotions | Admin | marketing_manager | List promotions | N/A |
| Admin promotions | POST | /api/v1/admin/promotions | Admin | marketing_manager | Create promotion | N/A |
| Admin promotions | GET | /api/v1/admin/promotions/{promotionId} | Admin | marketing_manager | Get promotion | N/A |
| Admin promotions | PATCH | /api/v1/admin/promotions/{promotionId} | Admin | marketing_manager | Update promotion | N/A |
| Admin promotions | DELETE | /api/v1/admin/promotions/{promotionId} | Admin | marketing_manager | Delete promotion | N/A |
| Admin promotions | POST | /api/v1/admin/promotions/{promotionId}/activation | Admin | marketing_manager | Activate or deactivate promotion | N/A |
| Admin reviews | GET | /api/v1/admin/reviews | Admin | support\|catalog_manager | List reviews for moderation | N/A |
| Admin reviews | POST | /api/v1/admin/reviews/{reviewId}/approve | Admin | support\|catalog_manager | Approve review | N/A |
| Admin reviews | POST | /api/v1/admin/reviews/{reviewId}/reject | Admin | support\|catalog_manager | Reject review | N/A |
| Admin reviews | DELETE | /api/v1/admin/reviews/{reviewId} | Admin | support\|catalog_manager | Delete review | N/A |
| Admin notifications | GET | /api/v1/admin/notifications | Admin | marketing_manager\|support | List notification history | N/A |
| Admin notifications | POST | /api/v1/admin/notifications | Admin | marketing_manager\|support | Send notification campaign | N/A |
| Admin notifications | POST | /api/v1/admin/notifications/{notificationId}/resend | Admin | support | Resend transactional notification | N/A |
| Admin settings | GET | /api/v1/admin/settings | Admin | admin | Get store settings | N/A |
| Admin settings | PATCH | /api/v1/admin/settings | Admin | admin | Update store settings | N/A |
| Admin banners | GET | /api/v1/admin/banners | Admin | marketing_manager | List banners | N/A |
| Admin banners | POST | /api/v1/admin/banners | Admin | marketing_manager | Create banner | N/A |
| Admin banners | GET | /api/v1/admin/banners/{bannerId} | Admin | marketing_manager | Get banner | N/A |
| Admin banners | PATCH | /api/v1/admin/banners/{bannerId} | Admin | marketing_manager | Update banner | N/A |
| Admin banners | DELETE | /api/v1/admin/banners/{bannerId} | Admin | marketing_manager | Delete banner | N/A |
| Admin heroes | GET | /api/v1/admin/heroes | Admin | marketing_manager | List hero slides | N/A |
| Admin heroes | POST | /api/v1/admin/heroes | Admin | marketing_manager | Create hero slide | N/A |
| Admin heroes | GET | /api/v1/admin/heroes/{heroId} | Admin | marketing_manager | Get hero slide | N/A |
| Admin heroes | PATCH | /api/v1/admin/heroes/{heroId} | Admin | marketing_manager | Update hero slide | N/A |
| Admin heroes | DELETE | /api/v1/admin/heroes/{heroId} | Admin | marketing_manager | Delete hero slide | N/A |
| Admin home | POST | /api/v1/admin/home/sections/reorder | Admin | marketing_manager | Reorder home sections | N/A |
| Admin home | PATCH | /api/v1/admin/home/sections/{sectionId} | Admin | marketing_manager | Update home section | N/A |
| Admin lookbooks | GET | /api/v1/admin/lookbooks | Admin | marketing_manager | List lookbooks | N/A |
| Admin lookbooks | POST | /api/v1/admin/lookbooks | Admin | marketing_manager | Create lookbook | N/A |
| Admin lookbooks | GET | /api/v1/admin/lookbooks/{lookbookId} | Admin | marketing_manager | Get lookbook | N/A |
| Admin lookbooks | PATCH | /api/v1/admin/lookbooks/{lookbookId} | Admin | marketing_manager | Update lookbook | N/A |
| Admin lookbooks | DELETE | /api/v1/admin/lookbooks/{lookbookId} | Admin | marketing_manager | Delete lookbook | N/A |
| Admin testimonials | GET | /api/v1/admin/testimonials | Admin | marketing_manager | List testimonials | N/A |
| Admin testimonials | POST | /api/v1/admin/testimonials | Admin | marketing_manager | Create testimonial | N/A |
| Admin testimonials | GET | /api/v1/admin/testimonials/{testimonialId} | Admin | marketing_manager | Get testimonial | N/A |
| Admin testimonials | PATCH | /api/v1/admin/testimonials/{testimonialId} | Admin | marketing_manager | Update testimonial | N/A |
| Admin testimonials | DELETE | /api/v1/admin/testimonials/{testimonialId} | Admin | marketing_manager | Delete testimonial | N/A |
| Admin blog posts | GET | /api/v1/admin/blog-posts | Admin | marketing_manager | List blog posts | N/A |
| Admin blog posts | POST | /api/v1/admin/blog-posts | Admin | marketing_manager | Create blog post | N/A |
| Admin blog posts | GET | /api/v1/admin/blog-posts/{postId} | Admin | marketing_manager | Get blog post | N/A |
| Admin blog posts | PATCH | /api/v1/admin/blog-posts/{postId} | Admin | marketing_manager | Update blog post | N/A |
| Admin blog posts | DELETE | /api/v1/admin/blog-posts/{postId} | Admin | marketing_manager | Delete blog post | N/A |
| Admin wardrobe | GET | /api/v1/admin/wardrobe/configuration | Admin | admin | Get wardrobe configuration | N/A |
| Admin wardrobe | PATCH | /api/v1/admin/wardrobe/configuration | Admin | admin | Update wardrobe configuration | N/A |
| Admin body zones | GET | /api/v1/admin/body-zones | Admin | catalog_manager\|marketing_manager | List body zones | N/A |
| Admin body zones | POST | /api/v1/admin/body-zones | Admin | catalog_manager\|marketing_manager | Create body zone | N/A |
| Admin body zones | GET | /api/v1/admin/body-zones/{bodyZoneId} | Admin | catalog_manager\|marketing_manager | Get body zone | N/A |
| Admin body zones | PATCH | /api/v1/admin/body-zones/{bodyZoneId} | Admin | catalog_manager\|marketing_manager | Update body zone | N/A |
| Admin body zones | DELETE | /api/v1/admin/body-zones/{bodyZoneId} | Admin | catalog_manager | Delete or archive body zone | N/A |
| Admin body zones | POST | /api/v1/admin/body-zones/{bodyZoneId}/activation | Admin | catalog_manager\|marketing_manager | Activate or deactivate body zone | N/A |
| Admin body zones | POST | /api/v1/admin/body-zones/reorder | Admin | catalog_manager\|marketing_manager | Reorder body zones | N/A |
| Admin body zones | POST | /api/v1/admin/body-zones/{bodyZoneId}/category-mappings | Admin | catalog_manager\|marketing_manager | Assign category mapping | N/A |
| Admin body zones | DELETE | /api/v1/admin/body-zones/{bodyZoneId}/category-mappings/{mappingId} | Admin | catalog_manager\|marketing_manager | Remove category mapping | N/A |
| Admin body zones | PATCH | /api/v1/admin/body-zones/{bodyZoneId}/hotspot | Admin | catalog_manager\|marketing_manager | Update hotspot and SVG region | N/A |
| Admin body zones | POST | /api/v1/admin/body-zones/{bodyZoneId}/assets | Admin | catalog_manager\|marketing_manager | Attach body-zone asset | N/A |
| Admin body zones | DELETE | /api/v1/admin/body-zones/{bodyZoneId}/assets/{assetId} | Admin | catalog_manager\|marketing_manager | Remove body-zone asset | N/A |
| Admin media | GET | /api/v1/admin/media | Admin | catalog_manager\|marketing_manager\|admin | Search media library | N/A |

