# BabyLove production API endpoint specification

**API version:** `v1`  
**Base URL:** `https://api.babylove.example/api/v1`  
**Design status:** production contract; the Angular application's JSON Server, hard-coded values, simulated checkout, and browser storage are explicitly **not** API contracts.

## Scope and source traceability

This specification was derived by recursively inspecting the Angular routes, pages, components, services, signal stores, models, forms/validators, guard/interceptors, translations, static assets, and `backend/db.json`. The fixture contains products with SKU attributes/images/stock, localized categories, content modules, orders, users/addresses, and `wardrobeItems`; it does not define the production routes below.

The current landing-page `LookbookModule.hotspots` is generalized into the required Shop-by-Body-Part body-zone resources. It must be data-driven: no product/category IDs are embedded in an Angular component. BabyLove is modeled here as a general fashion store, not a children's store.

`FR-*` values in the inventory resolve to the exact frontend references in [Frontend traceability](#frontend-traceability). `N/A (production capability)` means no present Angular view exists; it is still a required admin or platform operation and must not be omitted.

## Contract conventions applying to every endpoint

### Authentication, roles, ownership, and headers

| Rule | Contract |
| --- | --- |
| Authentication | `Public` means no credential. `Customer` means `Authorization: Bearer <accessToken>`. `Admin` means an authenticated `admin` or `manager`; an admin-only operation states its minimum role. |
| Roles | `customer`, `support`, `catalog_manager`, `fulfillment_manager`, `marketing_manager`, `admin`. Admin inherits all listed management capabilities; no client may assign itself a role. |
| Ownership | `self` is the authenticated subject. Customer resources (profile, addresses, cart, wishlist, recent history, notifications, orders, reviews, wardrobe and private media) are filtered to `self` server-side; an ID alone never grants access. `admin` bypasses ownership only on the documented admin path. |
| Required headers | All JSON writes send `Content-Type: application/json`, `Accept: application/json`, and, where stated, `Idempotency-Key: <UUID>`. Authenticated writes also send Bearer authorization. Browser calls may send `Accept-Language: en` or `ar` and `X-Currency: USD` or `EGP`; displayed currency never changes settlement currency. |
| Media headers | Direct-upload PUT uses the exact `uploadHeaders` returned by the initiate operation. Multipart fallback uses `multipart/form-data` and must not manually set its boundary. |
| Request IDs and limits | Responses include `X-Request-Id`; errors repeat it as `requestId`. Public/auth endpoints are rate-limited (especially login/reset/newsletter); a `429` includes `Retry-After`. |

### Success, errors, pagination, filtering, and idempotency

Non-paginated successes use:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": { "id": "prd_01J..." }
}
```

Paginated successes replace `data` with an array and include:

```json
"meta": {
  "page": 1,
  "limit": 20,
  "total": 100,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

All errors use:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": { "email": ["Email is required"] },
  "requestId": "req_123456"
}
```

`page` is 1-based; `limit` defaults to 20 and is 1–100. List records are stable-sorted by `sortBy` and `sortOrder` (`asc` or `desc`); invalid sort fields return `VALIDATION_ERROR`. Repeated filter values use one comma-separated value (`size=S,M`, `color=black,navy`) and are ORed within a filter but ANDed across filters. Dates are ISO-8601 UTC. Money is a non-negative decimal string in responses and is never accepted as a client-authoritative total.

`Idempotent` in the inventory means the client **must** send `Idempotency-Key`; the server stores the key plus request fingerprint for 24 hours and replays the original 2xx result. Safe GET/DELETE operations are intrinsically idempotent. `No` means the endpoint is naturally idempotent by resource uniqueness or is a read; clients may still retry only after checking its result.

Common errors are: `VALIDATION_ERROR` (400), `UNAUTHORIZED` / `INVALID_TOKEN` / `EXPIRED_TOKEN` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `DUPLICATE_RESOURCE` / `CONFLICT` (409), `INVALID_VARIANT` (422), `OUT_OF_STOCK` (409), `INVALID_COUPON` / `EXPIRED_COUPON` (422), `PAYMENT_FAILED` (402), `UPLOAD_FAILED` (502), `UNSUPPORTED_MEDIA_TYPE` (415), `RATE_LIMITED` (429), and `INTERNAL_ERROR` (500). Each inventory record lists additions to this baseline.

### Standard query parameters

`page`, `limit`, `search`, `sortBy`, `sortOrder`, `status`, `createdFrom`, and `createdTo` have the meanings above when present. Product-listing supports `category`, `subcategory`, `brand`, `collection`, `minPrice`, `maxPrice`, `size`, `color`, `material`, `rating`, `inStock`, `onSale`, `featured`, `bodyZone`, `audience`, `type`, `slug`, and `include`. `include` is a comma list of documented expandable representations (`variants,images,attributes,ratingSummary,category,brand,availability`). `GET /products` is the one product-search/filter/category/brand/collection/body-zone listing endpoint; no mock `_page`, `_limit`, `_sort`, `_order`, `_expand`, `q`, or JSON Server range filters are valid production parameters.

### Validation and domain enums

| Value | Allowed values / validation |
| --- | --- |
| Locale and preferences | `language: en|ar`; `currency: USD|EGP`; time zone is IANA. Localized content has both `en` and `ar` unless explicitly draft-only. |
| User | email RFC-compatible, normalized lower-case, max 254; password 12–128 characters with upper, lower, number, and symbol; username 3–40 `[A-Za-z0-9_.-]`; names 1–100; phone E.164. User status: `pending_verification|active|suspended|deleted`. |
| Catalog | product status `draft|active|archived`; stock status `in_stock|low_stock|out_of_stock|backorder`; discount type `percentage|fixed`; audience `women|men|unisex`; publication requires a category, at least one active sellable variant, a price, and a primary image. |
| Order | order status `pending_payment|confirmed|processing|shipped|delivered|cancelled|return_requested|returned|refunded`; payment status `pending|authorized|paid|failed|partially_refunded|refunded`; fulfillment status `unfulfilled|processing|partially_fulfilled|fulfilled|returned|cancelled`; payment method `card|cash_on_delivery|apple_pay|paypal|wallet`. |
| Wardrobe | type `product|upload`; visibility currently only `private`; season `spring|summer|autumn|winter|all_season`; category/color/tags are owner metadata. |
| Body zone | `head|upper_body|full_body|lower_body|hands|feet|accessories`; slug is immutable while active and `[a-z0-9-]{2,50}`. |
| Media | purpose `avatar|product_image|category_image|brand_logo|collection_image|review_image|wardrobe_image|home_banner|body_zone_asset`; JPEG/PNG/WebP/AVIF only, 10 MB max for images; scan/quarantine before completion; wardrobe originals are private. |

### Reusable request/response examples

Each inventory row names an `EX-*` family. Combining that family with the row's exact method/path, named request schema, route/query values, authentication, and response schema is the complete example for that endpoint; it avoids repeating an identical envelope hundreds of times.

| Example | Request and success response | Validation example |
| --- | --- | --- |
| `EX-READ` | `GET /api/v1/products?category=women&size=S,M&page=1&limit=20` → `200` with the paginated envelope and `data: [{"id":"prd_coat_01","slug":"italian-wool-overcoat","price":{"amount":"389.00","currency":"USD"},"availability":{"status":"in_stock"}}]`. | `?limit=101` → `400 VALIDATION_ERROR`, `errors.limit: ["Must be between 1 and 100"]`. |
| `EX-CREATE` | `POST /api/v1/wishlist/items`, body `{"productId":"prd_coat_01","variantId":"var_coat_black_m"}` → `201`, `data: {"id":"wli_01","productId":"prd_coat_01","variantId":"var_coat_black_m"}`. | Missing `productId` → `400`, `errors.productId: ["Product ID is required"]`. |
| `EX-PATCH` | `PATCH /api/v1/me/preferences`, body `{"language":"ar","currency":"EGP"}` → `200`, `data: {"language":"ar","currency":"EGP"}`. | `currency: "GBP"` → `400`, `errors.currency: ["Must be one of USD, EGP"]`. |
| `EX-ACTION` | `POST /api/v1/orders/ord_01/cancel`, header `Idempotency-Key: 03a8…`, body `{"reason":"ordered_by_mistake"}` → `200`, `data: {"id":"ord_01","status":"cancelled"}`. | illegal transition → `409 CONFLICT`, `errors.status: ["Shipped orders cannot be cancelled"]`. |
| `EX-UPLOAD` | `POST /api/v1/media/uploads`, body `{"purpose":"wardrobe_image","fileName":"linen-look.webp","contentType":"image/webp","sizeBytes":512000,"visibility":"private"}` → `201`, `data: {"mediaId":"med_01","uploadUrl":"https://storage…","uploadHeaders":{},"expiresAt":"2026-07-16T10:05:00Z"}`; then PUT bytes to `uploadUrl`, then `POST /media/uploads/med_01/complete` → `200` with `data: {"id":"med_01","status":"ready"}`. | Unsupported `contentType` → `415 UNSUPPORTED_MEDIA_TYPE`, `errors.contentType: ["Only JPEG, PNG, WebP, and AVIF are accepted"]`. |

## Schemas used by the inventory

The following named request schemas identify field types, required/optional fields, and server rules. The OpenAPI draft gives the authoritative machine-readable versions.

| Schema | Required fields | Optional fields and rules |
| --- | --- | --- |
| `RegisterRequest` | `username:string`, `email:email`, `password:string`, `firstName:string`, `lastName:string` | `language`, `currency`, `marketingConsent:boolean`. Never accept `role`, avatar data URLs, or client-generated user IDs. |
| `LoginRequest` | `email`, `password` | `rememberMe:boolean`; response returns profile, access token, and refresh token/session metadata. |
| `ProfilePatch` | at least one of `firstName`, `lastName`, `phoneNumber`, `gender`, `dateOfBirth` | Fields follow user validation; email changes use a separate verified flow. |
| `AddressRequest` | `fullName`, `phone`, `line1`, `city`, `countryCode` | `line2`, `region`, `postalCode`, `label`, `isDefaultShipping`, `isDefaultBilling`; country ISO-3166 alpha-2, postal format is country-aware. |
| `ProductCreate/Patch` | create: `slug`, localized `title`, `categoryId`, `status`; patch: one editable field | `brandId`, `collectionIds`, `description`, `material`, `tags`, `bodyZoneSlugs`, `audience`, SEO, featured flags. Product price lives on variants. |
| `VariantCreate/Patch` | create: `sku`, `price.amount`, `price.currency`, `attributes` | `compareAtPrice`, `barcode`, `weightGrams`, `isActive`, `images`; attributes are key/value IDs such as size/color/fit. |
| `CartItemRequest` | `productId`, `variantId`, `quantity:int` | quantity 1–99 and variant must belong to active product; price/totals/coupon calculations are ignored if sent. |
| `CouponRequest` | `code:string` | code is trimmed/upper-cased; server validates customer, time, inventory, minimum spend, stacking, and usage limits. |
| `CheckoutInitRequest` | `shippingAddressId` or `shippingAddress:AddressRequest` | `billingAddressId`, `billingAddress`, `shippingMethodId`, `paymentMethodCode`, `couponCode`; server snapshots prices and reserves stock. |
| `PlaceOrderRequest` | `checkoutId`, `paymentAttemptId` where payment requires it | no item prices, quantities, totals, stock, tax, or shipping values are accepted; mandatory `Idempotency-Key`. |
| `ReviewCreate/Patch` | create: `rating:int 1–5`, `title:string`, `body:string` | `mediaIds:string[]`; only a purchaser after delivery may create one review per product/variant, and updates are limited to own approved policy. |
| `WardrobeProductRequest` | `productId` | `variantId`, `title`, `notes`, `tags:string[]`, `category`, `color`, `season`, `visibility`; tuple `(owner,productId,variantId)` is unique. |
| `WardrobeUploadRequest/Patch` | create: `mediaId` | `title` 0–140, `notes` 0–2000, tags max 20 / each 32, `category`, `color`, `season`, `visibility`; media must be ready, private, and owned by self. |
| `BodyZoneCreate/Patch` | create: `slug`, `labels.en`, `labels.ar`, `hotspot.svgRegionKey` | `iconMediaId`, `isActive`, `displayOrder`, desktop/mobile `{x,y,width,height}` 0–100; mappings use category/subcategory IDs. |
| `MediaInitiateRequest` | `purpose`, `fileName`, `contentType`, `sizeBytes` | `visibility` default is scope-specific. Server authorizes the purpose/parent before issuing a short-lived signed URL. |

## Endpoint inventory

The `Input` column lists route parameters (`{…}`), permitted query parameters, content type/body schema, plus endpoint-specific validation. All rows inherit headers, envelope, standard errors, pagination/filtering, sorting, and idempotency rules above. `200/201/202/204` in `Result` is the successful status; `+` lists meaningful extra errors. A dash in `Query` means none. No final endpoint exposes a JSON Server route.

### Authentication and user identity

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| AU01 | `POST /auth/register` | Create a customer account; Public. | JSON `RegisterRequest`; duplicate normalized email/username rejected. | `201 UserSession`; verification email queued; `EX-CREATE`; +409 duplicate. `FR-AUTH-REGISTER` |
| AU02 | `POST /auth/login` | Authenticate a verified active account; Public. | JSON `LoginRequest`. | `200 UserSession`; throttle failures and do not disclose account existence; `EX-CREATE`; +401/429. `FR-AUTH-LOGIN` |
| AU03 | `POST /auth/logout` | Revoke the current refresh-token session; Customer self. | JSON `{refreshToken?:string}`; current session inferred from secure cookie/token if omitted. | `204`; always succeeds for a valid authenticated session; `EX-ACTION`. `FR-AUTH-LOGOUT` |
| AU04 | `POST /auth/refresh` | Rotate access/refresh tokens; Public with refresh cookie or token. | JSON `{refreshToken?:string}`. | `200 UserSession`; rotate and revoke old token; +401 invalid/expired/revoked. `FR-AUTH-SESSION` |
| AU05 | `GET /auth/session` | Return current authenticated principal and session expiry; Customer self. | No body. | `200 UserSession`; `EX-READ`. `FR-AUTH-SESSION` |
| AU06 | `POST /auth/verify-email` | Verify email token; Public. | JSON `{token:string}`. | `200 User`; one-time token; +400 expired/used. `FR-AUTH-REGISTER` |
| AU07 | `POST /auth/resend-verification` | Send a new verification email without account enumeration; Public. | JSON `{email:email}`. | `202`; rate limited; `EX-ACTION`. `FR-AUTH-REGISTER` |
| AU08 | `POST /auth/forgot-password` | Queue reset email without account enumeration; Public. | JSON `{email:email}`. | `202`; `EX-ACTION`; +429. `FR-AUTH-FORGOT` |
| AU09 | `POST /auth/reset-password` | Consume reset token and set password; Public. | JSON `{token:string,password:string}`. | `200`; revoke all sessions except optionally current; `EX-ACTION`; +400 token. `FR-AUTH-FORGOT` |
| AU10 | `POST /auth/change-password` | Change own password; Customer self. | JSON `{currentPassword:string,newPassword:string}`. | `200`; revoke other sessions; `EX-ACTION`; +401 current password. `FR-SETTINGS` |
| AU11 | `GET /auth/sessions` | List own active sessions; Customer self. | Query `page,limit`. | `200 Page<Session>`; never reveal refresh tokens; `EX-READ`. `FR-SETTINGS` |
| AU12 | `DELETE /auth/sessions/{sessionId}` | Revoke one own session; Customer self. | `{sessionId}` UUID. | `204`; current session may only be revoked through logout; `EX-ACTION`; +404. `FR-SETTINGS` |

### Profile, preferences, addresses, and customer state

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| US01 | `GET /me` | Get own profile; Customer self. | Query `include=addresses,preferences`. | `200 User`; excludes password/security secrets; `EX-READ`. `FR-PROFILE` |
| US02 | `PATCH /me` | Update own profile; Customer self. | JSON `ProfilePatch`. | `200 User`; email/role/status immutable here; `EX-PATCH`. `FR-PROFILE` |
| US03 | `POST /me/avatar` | Attach a ready `avatar` media asset; Customer self. | JSON `{mediaId:string}`; media must be own/ready/purpose avatar. | `200 User`; replaces prior avatar safely; `EX-UPLOAD`. `FR-PROFILE-AVATAR` |
| US04 | `DELETE /me/avatar` | Remove own avatar link and private asset when unreferenced; Customer self. | No body. | `204`; `EX-ACTION`. `FR-PROFILE-AVATAR` |
| US05 | `PATCH /me/preferences` | Save language/currency/time-zone; Customer self. | JSON `{language?:enum,currency?:enum,timeZone?:string}`. | `200 Preferences`; `EX-PATCH`. `FR-SETTINGS` |
| US06 | `PATCH /me/notification-preferences` | Save transactional/marketing/push settings; Customer self. | JSON `{orderUpdates?:boolean,offers?:boolean,newsletter?:boolean,push?:boolean}`. | `200 NotificationPreferences`; transactional consent cannot suppress legally necessary service messages; `EX-PATCH`. `FR-SETTINGS` |
| US07 | `DELETE /me` | Request/delete own account; Customer self. | JSON `{password:string,reason?:string}`; idempotency required. | `202`; anonymizes subject to legal/order retention and revokes sessions; `EX-ACTION`. `FR-SETTINGS` |
| AD01 | `GET /me/addresses` | List self addresses; Customer self. | Query `page,limit,sortBy,sortOrder`. | `200 Page<Address>`; `EX-READ`. `FR-PROFILE` |
| AD02 | `POST /me/addresses` | Create address; Customer self. | JSON `AddressRequest`. | `201 Address`; max 50; sets defaults atomically if first/default flags; `EX-CREATE`. `FR-CHECKOUT` |
| AD03 | `GET /me/addresses/{addressId}` | Get own address; Customer self. | `{addressId}`. | `200 Address`; `EX-READ`; +404 non-owner. `FR-PROFILE` |
| AD04 | `PATCH /me/addresses/{addressId}` | Update own address; Customer self. | `{addressId}`, JSON partial `AddressRequest`. | `200 Address`; retained order snapshots never change; `EX-PATCH`. `FR-PROFILE` |
| AD05 | `DELETE /me/addresses/{addressId}` | Delete own unused address; Customer self. | `{addressId}`. | `204`; reject currently required checkout reservation; reassign/clear default atomically; `EX-ACTION`. `FR-PROFILE` |
| AD06 | `POST /me/addresses/{addressId}/default-shipping` | Set default shipping address; Customer self. | `{addressId}`. | `200 Address`; exactly one self default shipping address; `EX-ACTION`. `FR-CHECKOUT` |
| AD07 | `POST /me/addresses/{addressId}/default-billing` | Set default billing address; Customer self. | `{addressId}`. | `200 Address`; exactly one self default billing address; `EX-ACTION`. `FR-CHECKOUT` |

### Public catalog, search, categories, brands, and collections

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| PR01 | `GET /products` | Main public product listing, search, and filtered browse; Public. | Query standard product filters plus `page,limit,sortBy=featured|price|rating|newest|bestSelling|discount,sortOrder`. | `200 Page<ProductCard>`; only active/published products; supports `featured=true`, `onSale=true`, `bodyZone`; prices/availability server-derived; `EX-READ`. `FR-SHOP` |
| PR02 | `GET /products/filter-metadata` | Return facets and current price bounds for the same filter scope; Public. | All non-pagination product filters. | `200 FilterMetadata`; contains categories, brands, sizes, colors, materials, collections, body zones, min/max; `EX-READ`. `FR-SHOP` |
| PR03 | `GET /products/suggestions` | Autocomplete product search; Public. | Query `q` 2–100 chars, `limit` 1–10. | `200 ProductSuggestion[]`; prefix/typo matching is rate-limited; `EX-READ`. `FR-HEADER-SEARCH` |
| PR04 | `GET /products/{productId}` | Product detail with localized content; Public. | `{productId}` opaque ID or query `include`. | `200 Product`; status must be sellable; `EX-READ`; +404. `FR-PRODUCT-DETAIL` |
| PR05 | `GET /products/{productId}/variants` | List sellable variants, selected attributes and prices; Public. | `{productId}`, query `include=images,availability`. | `200 Variant[]`; inactive variants omitted; `EX-READ`. `FR-PRODUCT-DETAIL` |
| PR06 | `GET /products/{productId}/images` | Get public product/variant image records; Public. | `{productId}`, query `variantId`. | `200 Media[]`; CDN URLs only for public approved assets; `EX-READ`. `FR-PRODUCT-DETAIL` |
| PR07 | `GET /products/{productId}/availability` | Current availability by variant; Public. | `{productId}`, query `variantId`. | `200 Availability`; do not expose raw inventory quantity except permitted low-stock label; `EX-READ`. `FR-PRODUCT-DETAIL` |
| PR08 | `GET /products/{productId}/related` | Related products; Public. | `{productId}`, query `limit` 1–24. | `200 ProductCard[]`; excludes product itself and inactive products; `EX-READ`. `FR-PRODUCT-DETAIL` |
| PR09 | `GET /products/{productId}/similar` | Similar-product algorithm result; Public. | `{productId}`, query `limit`. | `200 ProductCard[]`; `EX-READ`. `FR-PRODUCT-DETAIL` |
| PR10 | `GET /products/recommendations` | Anonymous/session/personal recommendations; Public or Customer. | Query `context=home|product|cart`, `productId`, `limit`; Bearer enables private personalization. | `200 ProductCard[]`; no sensitive inference exposed; `EX-READ`. `FR-HOME` |
| CT01 | `GET /categories` | Active category tree; Public. | Query `parentId,include=children,image,productCount,locale`. | `200 Category[]`; default display order; `EX-READ`. `FR-CATEGORIES` |
| CT02 | `GET /categories/{categoryId}` | Category detail; Public. | `{categoryId}`, query `include=children,image`. | `200 Category`; `EX-READ`. `FR-CATEGORIES` |
| CT03 | `GET /categories/{categoryId}/subcategories` | Direct active children; Public. | `{categoryId}`, query `page,limit`. | `200 Page<Category>`; `EX-READ`. `FR-CATEGORIES` |
| BR01 | `GET /brands` | Active brands; Public. | Query `page,limit,search,sortBy=displayOrder|name`. | `200 Page<Brand>`; `EX-READ`. `FR-SHOP` |
| BR02 | `GET /brands/{brandId}` | Brand detail; Public. | `{brandId}`. | `200 Brand`; `EX-READ`. `FR-SHOP` |
| CL01 | `GET /collections` | Active collections; Public. | Query `page,limit,featured,status=active`. | `200 Page<Collection>`; `EX-READ`. `FR-HOME` |
| CL02 | `GET /collections/{collectionId}` | Collection detail; Public. | `{collectionId}`, query `include=products`. | `200 Collection`; collection products are paginated in embedded link or `/products?collection=`; `EX-READ`. `FR-HOME` |

### Home, editorial content, newsletter, and Shop-by-Body-Part

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| HM01 | `GET /home` | Resolve configured home-page sections in display order; Public. | Query `locale,include=products,bodyZones`. | `200 HomePage`; sections are active and date-windowed; `EX-READ`. `FR-HOME` |
| HM02 | `GET /home/sections` | Get individual active home sections; Public. | Query `type,locale`. | `200 HomeSection[]`; types include `hero,promotion,featured_categories,featured_products,collection,new_arrivals,best_sellers,sale,body_zones,brands,testimonials,lookbook,blog`; `EX-READ`. `FR-HOME` |
| HM03 | `GET /heroes` | Active time-valid hero banners; Public. | Query `locale`. | `200 Hero[]`; includes desktop/mobile media and CTA route; `EX-READ`. `FR-HERO` |
| HM04 | `GET /banners` | Active promotional banners; Public. | Query `placement,locale`. | `200 Banner[]`; `EX-READ`. `FR-HOME` |
| HM05 | `GET /lookbooks` | Active interactive lookbook modules; Public. | Query `locale,include=hotspots`. | `200 Lookbook[]`; hotspot filters reference category/type/body-zone values, never hard-coded product IDs; `EX-READ`. `FR-LOOKBOOK` |
| HM06 | `GET /testimonials` | Active approved testimonials; Public. | Query `limit,locale`. | `200 Testimonial[]`; `EX-READ`. `FR-HOME` |
| CM01 | `GET /blog-posts` | Published fashion editorial list; Public. | Query `page,limit,search,category,tag,featured,sortBy=publishedAt`. | `200 Page<BlogPost>`; only published; `EX-READ`. `FR-BLOG` |
| CM02 | `GET /blog-posts/{slug}` | Published post and linked product IDs; Public. | `{slug}`, query `include=relatedProducts`. | `200 BlogPost`; `EX-READ`. `FR-BLOG-DETAIL` |
| HM07 | `POST /newsletter-subscriptions` | Subscribe email; Public. | JSON `{email:email,locale:en|ar,consent:boolean}`; consent must be true. | `202`; double opt-in and unsubscription token; idempotent by email; `EX-CREATE`; +409 suppressed. `FR-NEWSLETTER` |
| BZ01 | `GET /body-zones` | Get active zones and bilingual labels; Public. | Query `locale,include=productCount,hotspot,categoryMappings`. | `200 BodyZone[]`; stable `displayOrder`; `EX-READ`. `FR-BODY-ZONE` |
| BZ02 | `GET /body-zones/{bodyZoneSlug}` | Get one active zone; Public. | `{bodyZoneSlug}`, query `include=hotspot,categoryMappings,productCount`. | `200 BodyZone`; returns `labels.en/ar`, SVG key, desktop/mobile coordinates, mapped categories; `EX-READ`. `FR-BODY-ZONE` |
| BZ03 | `GET /body-zones/{bodyZoneSlug}/hotspot` | Get current hotspot/asset configuration; Public. | `{bodyZoneSlug}`, query `viewport=desktop|mobile`. | `200 BodyZoneHotspot`; public asset URL only; `EX-READ`. `FR-BODY-ZONE` |
| BZ04 | `GET /body-zones/{bodyZoneSlug}/category-mappings` | Get category/subcategory mappings and count; Public. | `{bodyZoneSlug}`. | `200 BodyZoneMapping[]`; product browse remains `GET /products?bodyZone={slug}`; `EX-READ`. `FR-BODY-ZONE` |

### Wishlist, cart, recently viewed, coupons, checkout, payment, shipping, and orders

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| WL01 | `GET /wishlist` | Get self wishlist; Customer self. | Query `page,limit,include=product,availability`. | `200 Page<WishlistItem>`; one row per product/variant tuple; `EX-READ`. `FR-WISHLIST` |
| WL02 | `POST /wishlist/items` | Save product/variant; Customer self. | JSON `{productId:string,variantId?:string}`. | `201 WishlistItem` or `200` existing item; unique owner/product/variant prevents duplicates; `EX-CREATE`. `FR-WISHLIST` |
| WL03 | `GET /wishlist/items/check` | Check saved state; Customer self. | Query `productId` required, `variantId`. | `200 {saved:boolean,itemId?:string}`; `EX-READ`. `FR-PRODUCT-DETAIL` |
| WL04 | `DELETE /wishlist/items/{wishlistItemId}` | Remove self wishlist item; Customer self. | `{wishlistItemId}`. | `204`; `EX-ACTION`; +404 non-owner. `FR-WISHLIST` |
| WL05 | `DELETE /wishlist/items` | Clear self wishlist; Customer self. | No body. | `204`; `EX-ACTION`. `FR-WISHLIST` |
| WL06 | `POST /wishlist/items/{wishlistItemId}/move-to-cart` | Add saved variant to cart and remove saved item atomically; Customer self. | `{wishlistItemId}`, JSON `{quantity?:int}`. | `200 Cart`; validates stock; `EX-ACTION`; +409 out of stock. `FR-WISHLIST` |
| CA01 | `GET /cart` | Get current self/guest cart and server totals; Customer or guest cart token. | Query `include=items,availability`. | `200 Cart`; only server calculates lines, discount, shipping, tax, grand total; `EX-READ`. `FR-CART` |
| CA02 | `POST /cart/items` | Add/merge cart line; Customer or guest cart token. | JSON `CartItemRequest`; idempotency required. | `201 Cart`; variant is required even if current UI stores product only; `EX-CREATE`; +422 invalid variant/+409 stock. `FR-CART` |
| CA03 | `PATCH /cart/items/{cartItemId}` | Set line quantity; Customer/guest owner. | `{cartItemId}`, JSON `{quantity:int}`. | `200 Cart`; quantity zero is invalid—use delete; re-prices/revalidates; `EX-PATCH`. `FR-CART` |
| CA04 | `DELETE /cart/items/{cartItemId}` | Remove line; Customer/guest owner. | `{cartItemId}`. | `204`; `EX-ACTION`. `FR-CART` |
| CA05 | `DELETE /cart/items` | Clear current cart; Customer/guest owner. | No body. | `204`; reservations released; `EX-ACTION`. `FR-CART` |
| CA06 | `POST /cart/validate` | Validate stock, pricing, coupons, shipping/tax prerequisites; Customer/guest owner. | JSON `{shippingAddressId?:string,shippingAddress?:AddressRequest}`. | `200 CartValidation`; never trusts submitted totals; `EX-ACTION`. `FR-CART` |
| CA07 | `POST /cart/merge` | Merge signed guest cart after login; Customer self. | JSON `{guestCartToken:string,mode?:merge|replace}`; idempotency required. | `200 Cart`; combines matching variant quantities subject to stock; `EX-ACTION`. `FR-AUTH-LOGIN` |
| CA08 | `POST /cart/coupon` | Apply coupon; Customer/guest owner. | JSON `CouponRequest`; idempotency required. | `200 Cart`; server recalculates all totals; `EX-ACTION`; +422 coupon. `FR-CART` |
| CA09 | `DELETE /cart/coupon` | Remove applied coupon; Customer/guest owner. | No body. | `200 Cart`; recalculates totals; `EX-ACTION`. `FR-CART` |
| CO01 | `POST /coupons/validate` | Preview a coupon for current cart; Customer/guest owner. | JSON `CouponRequest`. | `200 CouponValidation`; no application side effect; `EX-ACTION`. `FR-CART` |
| CO02 | `GET /promotions` | Show eligible public/current-cart promotions; Public or Customer. | Query `context=home|cart,productId,categoryId`. | `200 Promotion[]`; actual eligibility is rechecked at order time; `EX-READ`. `FR-HOME` |
| CH01 | `POST /checkout` | Initialize checkout and stock reservation; Customer self. | JSON `CheckoutInitRequest`; idempotency required. | `201 Checkout`; expires in returned `expiresAt`; lock prices/tax/shipping; `EX-CREATE`. `FR-CHECKOUT` |
| CH02 | `GET /checkout/{checkoutId}` | Retrieve own checkout state/expiry; Customer self. | `{checkoutId}`. | `200 Checkout`; `EX-READ`. `FR-CHECKOUT` |
| CH03 | `POST /checkout/{checkoutId}/validate` | Revalidate before payment/order; Customer self. | `{checkoutId}`, JSON optional address/method patch. | `200 Checkout`; invalidates expired stock/coupon/rate; `EX-ACTION`. `FR-CHECKOUT` |
| CH04 | `GET /checkout/{checkoutId}/preview` | Full order preview; Customer self. | `{checkoutId}`. | `200 OrderPreview`; server-only totals; `EX-READ`. `FR-CHECKOUT` |
| CH05 | `GET /checkout/{checkoutId}/shipping-methods` | Eligible methods/rates/delivery estimates; Customer self. | `{checkoutId}`. | `200 ShippingMethod[]`; destination/cart dependent; `EX-READ`. `FR-CHECKOUT` |
| CH06 | `POST /checkout/{checkoutId}/shipping-method` | Select a method and recalculate; Customer self. | `{checkoutId}`, JSON `{shippingMethodId:string}`. | `200 Checkout`; `EX-ACTION`. `FR-CHECKOUT` |
| CH07 | `GET /checkout/{checkoutId}/payment-methods` | Eligible payment methods; Customer self. | `{checkoutId}`. | `200 PaymentMethod[]`; no provider secret returned; `EX-READ`. `FR-CHECKOUT` |
| CH08 | `POST /checkout/{checkoutId}/payments` | Create payment attempt/provider handoff; Customer self. | `{checkoutId}`, JSON `{paymentMethodCode:enum,returnUrl?:uri}`; idempotency required. | `201 PaymentAttempt`; card details go to provider iframe/SDK, never this API; `EX-CREATE`; +402. `FR-CHECKOUT` |
| CH09 | `POST /checkout/{checkoutId}/place-order` | Atomically create order from valid checkout; Customer self. | `{checkoutId}`, JSON `PlaceOrderRequest`; `Idempotency-Key` mandatory. | `201 Order`; consume reservation, clear cart, create invoice; `EX-ACTION`; +409 expired/out of stock. `FR-CHECKOUT` |
| PY01 | `GET /payments/{paymentId}` | Get own payment status; Customer self. | `{paymentId}`. | `200 Payment`; `EX-READ`. `FR-CHECKOUT` |
| PY02 | `POST /payments/{paymentId}/verify` | Verify provider return state; Customer self. | `{paymentId}`, JSON `{providerReference?:string}`; idempotency required. | `200 Payment`; provider server-to-server verification required; `EX-ACTION`. `FR-CHECKOUT` |
| PY03 | `POST /payments/{paymentId}/retry` | Create retry for failed/requires-action payment; Customer self. | `{paymentId}`, JSON `{paymentMethodCode?:enum}`; idempotency required. | `201 PaymentAttempt`; no secret credentials; `EX-ACTION`; +409 non-retryable. `FR-CHECKOUT` |
| PY04 | `GET /payments/methods` | Discover displayable payment methods; Public or Customer. | Query `country,currency,checkoutId`. | `200 PaymentMethod[]`; availability is rechecked in checkout; `EX-READ`. `FR-CHECKOUT` |
| PY05 | `GET /payments/callback/{provider}` | Browser payment-return landing/callback; Public, signed state. | `{provider}`, query provider `state,reference`; no secret in URL. | `302` to frontend status route or `200`; provider signature/state verified; `EX-ACTION`. `FR-CHECKOUT` |
| PY06 | `POST /webhooks/payments/{provider}` | Receive payment provider webhook; Provider signature, not customer auth. | `{provider}`, raw signed body and provider headers. | `200/204`; verify signature, timestamp, de-duplicate event ID, process asynchronously; `EX-ACTION`; +401 invalid signature. `N/A (provider integration)` |
| SH01 | `GET /shipping/methods` | Public pre-checkout shipping options; Public. | Query `country,region,postalCode,currency`. | `200 ShippingMethod[]`; indicative only; `EX-READ`. `FR-CHECKOUT` |
| SH02 | `POST /shipping/rates` | Calculate destination/cart shipping rate; Customer or guest cart token. | JSON `{cartId?:string,address:AddressRequest}`. | `200 ShippingRate[]`; weight/dimensions/tax server-calculated; `EX-ACTION`. `FR-CHECKOUT` |
| SH03 | `GET /shipments/{shipmentId}` | Get own shipment details/tracking; Customer self. | `{shipmentId}`. | `200 Shipment`; `EX-READ`. `FR-ORDERS` |
| SH04 | `GET /shipments/{shipmentId}/tracking` | Get normalized tracking events and ETA; Customer self. | `{shipmentId}`. | `200 Tracking`; carrier reference may be public only if tokenized; `EX-READ`. `FR-ORDERS` |
| OR01 | `GET /orders` | List self orders; Customer self. | Query `page,limit,status,paymentStatus,createdFrom,createdTo,sortBy=createdAt|total`. | `200 Page<Order>`; never returns other customers; `EX-READ`. `FR-ORDERS` |
| OR02 | `GET /orders/{orderId}` | Get self order snapshot; Customer self. | `{orderId}`, query `include=items,payments,shipment,invoice`. | `200 Order`; pricing/address are immutable snapshots; `EX-READ`. `FR-ORDERS` |
| OR03 | `POST /orders/{orderId}/cancel` | Cancel eligible self order; Customer self. | `{orderId}`, JSON `{reason?:enum}`; idempotency required. | `200 Order`; releases/resets stock/payment according to state; `EX-ACTION`. `FR-ORDERS` |
| OR04 | `POST /orders/{orderId}/returns` | Request return for delivered order; Customer self. | `{orderId}`, JSON `{items:[{orderItemId,quantity,reason}],notes?:string}`. | `201 ReturnRequest`; quantities cannot exceed fulfilled minus already-returned; `EX-CREATE`. `FR-ORDERS` |
| OR05 | `GET /orders/{orderId}/refunds` | Get own refund statuses; Customer self. | `{orderId}`, query `page,limit`. | `200 Page<Refund>`; `EX-READ`. `FR-ORDERS` |
| OR06 | `POST /orders/{orderId}/reorder` | Add current sellable variants to cart; Customer self. | `{orderId}`, JSON `{replaceCart?:boolean}`; idempotency required. | `200 Cart`; prices/availability are current; `EX-ACTION`; +409 if no items available. `FR-ORDERS` |
| OR07 | `GET /orders/{orderId}/invoice` | Download self invoice; Customer self. | `{orderId}`, query `format=pdf`. | `302` signed download or `200 application/pdf`; audit access; `EX-READ`. `FR-ORDERS` |

### Reviews, notifications, recently viewed, and Saved Wardrobe

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| RV01 | `GET /products/{productId}/reviews` | Public approved review listing; Public. | `{productId}`, query `page,limit,rating,sortBy=createdAt|helpful`. | `200 Page<Review>`; only approved moderated reviews; `EX-READ`. `FR-PRODUCT-DETAIL` |
| RV02 | `GET /products/{productId}/rating-summary` | Public aggregate rating; Public. | `{productId}`. | `200 RatingSummary`; `EX-READ`. `FR-PRODUCT-DETAIL` |
| RV03 | `POST /products/{productId}/reviews` | Create own verified-purchase review; Customer self. | `{productId}`, JSON `ReviewCreate`; idempotency required. | `201 Review`; moderation status initially `pending`; `EX-CREATE`; +409 duplicate. `FR-PRODUCT-DETAIL` |
| RV04 | `PATCH /reviews/{reviewId}` | Update own review; Customer self. | `{reviewId}`, JSON partial `ReviewCreate`. | `200 Review`; resubmits moderation; `EX-PATCH`; +403 non-owner. `FR-PRODUCT-DETAIL` |
| RV05 | `DELETE /reviews/{reviewId}` | Delete own review; Customer self. | `{reviewId}`. | `204`; `EX-ACTION`. `FR-PRODUCT-DETAIL` |
| RV06 | `POST /reviews/{reviewId}/images` | Attach own ready review images; Customer self. | `{reviewId}`, JSON `{mediaIds:string[]}` max 5. | `200 Review`; assets must use `review_image`; `EX-UPLOAD`. `FR-PRODUCT-DETAIL` |
| RV07 | `POST /reviews/{reviewId}/helpful` | Mark review helpful once; Customer self. | `{reviewId}`; idempotency required. | `200 {helpfulCount:int}`; one vote per self; `EX-ACTION`. `FR-PRODUCT-DETAIL` |
| NT01 | `GET /notifications` | List self notifications; Customer self. | Query `page,limit,unread,type`. | `200 Page<Notification>`; `EX-READ`. `FR-SETTINGS` |
| NT02 | `GET /notifications/unread-count` | Get own unread count; Customer self. | No body. | `200 {count:int}`; `EX-READ`. `FR-HEADER` |
| NT03 | `POST /notifications/{notificationId}/read` | Mark one self notification read; Customer self. | `{notificationId}`. | `200 Notification`; idempotent; `EX-ACTION`. `FR-SETTINGS` |
| NT04 | `POST /notifications/read-all` | Mark all self notifications read; Customer self. | JSON `{type?:enum}`. | `200 {updated:int}`; idempotent; `EX-ACTION`. `FR-SETTINGS` |
| NT05 | `DELETE /notifications/{notificationId}` | Delete one self notification; Customer self. | `{notificationId}`. | `204`; `EX-ACTION`. `FR-SETTINGS` |
| NT06 | `DELETE /notifications` | Clear self notifications; Customer self. | Query `readOnly:boolean=true`. | `204`; default must only delete read messages; `EX-ACTION`. `FR-SETTINGS` |
| RC01 | `GET /recently-viewed` | Server-backed self recent products; Customer self. | Query `page,limit`. | `200 Page<RecentlyViewedItem>`; cap 20 and deduplicate per product; `EX-READ`. `FR-RECENT` |
| RC02 | `POST /recently-viewed` | Track product view; Customer self. | JSON `{productId:string}`; idempotent per product window. | `200 RecentlyViewedItem`; active product required; `EX-CREATE`. `FR-PRODUCT-DETAIL` |
| RC03 | `DELETE /recently-viewed/{productId}` | Remove one self history item; Customer self. | `{productId}`. | `204`; `EX-ACTION`. `FR-RECENT` |
| RC04 | `DELETE /recently-viewed` | Clear self history; Customer self. | No body. | `204`; `EX-ACTION`. `FR-RECENT` |
| WD01 | `GET /wardrobe` | List authenticated user's private wardrobe; Customer self. | Query `page,limit,type,category,color,season,tags,sortBy=createdAt|title|category,sortOrder`. | `200 Page<WardrobeItem>`; defaults `createdAt desc`; no cross-user query is honored; `EX-READ`. `FR-WARDROBE` |
| WD02 | `GET /wardrobe/{wardrobeItemId}` | Get one own wardrobe item; Customer self. | `{wardrobeItemId}`. | `200 WardrobeItem`; private upload URL is absent unless requested through WD11; `EX-READ`. `FR-WARDROBE` |
| WD03 | `POST /wardrobe/items` | Add a store product/variant; Customer self. | JSON `WardrobeProductRequest`; idempotency required. | `201 WardrobeItem` or `200` existing; no product snapshot supplied by client; prevents duplicate saved-product tuple; `EX-CREATE`. `FR-WARDROBE-SAVE` |
| WD04 | `POST /wardrobe/uploads` | Create wardrobe item from ready uploaded media; Customer self. | JSON `WardrobeUploadRequest`; idempotency required. | `201 WardrobeItem`; represents `type:upload`, never a fake product; `EX-CREATE`. `FR-WARDROBE-UPLOAD` |
| WD05 | `PATCH /wardrobe/{wardrobeItemId}` | Update own wardrobe metadata; Customer self. | `{wardrobeItemId}`, JSON partial `WardrobeUploadRequest`/metadata. | `200 WardrobeItem`; `type`, ownership, productId and mediaId immutable; `EX-PATCH`. `FR-WARDROBE` |
| WD06 | `DELETE /wardrobe/{wardrobeItemId}` | Delete own item; Customer self. | `{wardrobeItemId}`. | `204`; uploaded media is deleted only when unreferenced; `EX-ACTION`. `FR-WARDROBE` |
| WD07 | `DELETE /wardrobe/items/product` | Remove own saved store product by tuple; Customer self. | Query `productId` required, `variantId`. | `204`; idempotent when tuple is absent; `EX-ACTION`. `FR-WARDROBE-SAVE` |
| WD08 | `GET /wardrobe/items/check` | Check whether self saved product/variant; Customer self. | Query `productId` required, `variantId`. | `200 {saved:boolean,wardrobeItemId?:string}`; `EX-READ`. `FR-WARDROBE-SAVE` |
| WD09 | `GET /wardrobe/tags` | Get self tag vocabulary/counts; Customer self. | Query `search,limit`. | `200 WardrobeTag[]`; tags derive from own items only; `EX-READ`. `FR-WARDROBE` |
| WD10 | `PUT /wardrobe/tags/{tag}` | Rename/merge an own tag across own items; Customer self. | `{tag}` URL-encoded, JSON `{name:string}`; idempotency required. | `200 {updated:int}`; validates normalized unique target; `EX-PATCH`. `FR-WARDROBE` |
| WD11 | `GET /wardrobe/media/{mediaId}/url` | Obtain short-lived signed URL for own private wardrobe media; Customer self. | `{mediaId}`, query `disposition=inline|attachment`. | `200 {url:uri,expiresAt:date-time}`; verifies wardrobe ownership; `EX-READ`. `FR-WARDROBE` |
| WD12 | `DELETE /wardrobe/media/{mediaId}` | Delete an unneeded own uploaded image; Customer self. | `{mediaId}`. | `204`; reject when linked to a wardrobe item unless `detach=true`; `EX-ACTION`. `FR-WARDROBE-UPLOAD` |

### Media upload and retrieval flow

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| MD01 | `POST /media/uploads` | Initiate direct cloud upload; Customer for avatar/review/wardrobe, authorized manager for catalog/content scopes. | JSON `MediaInitiateRequest`; idempotency required. | `201 UploadSession`; purpose determines parent/visibility authorization; `EX-UPLOAD`. `FR-PROFILE-AVATAR, FR-WARDROBE-UPLOAD` |
| MD02 | `POST /media/uploads/{mediaId}/complete` | Complete, scan, transform, and persist media metadata; authorized uploader/manager. | `{mediaId}`, JSON `{checksum?:string}`. | `202 Media`; client must poll/retrieve only when `status=ready`; `EX-UPLOAD`; +422 checksum. `FR-PROFILE-AVATAR, FR-WARDROBE-UPLOAD` |
| MD03 | `POST /media/uploads/{mediaId}/cancel` | Cancel incomplete upload; authorized uploader/manager. | `{mediaId}`. | `204`; abort cloud multipart parts; `EX-ACTION`. `FR-WARDROBE-UPLOAD` |
| MD04 | `GET /media/{mediaId}` | Retrieve authorized media metadata/public URL; Public for public-ready assets, owner/admin for private. | `{mediaId}`. | `200 Media`; never emits private original URL; `EX-READ`. `FR-PRODUCT-DETAIL` |
| MD05 | `GET /media/{mediaId}/signed-url` | Retrieve signed private URL; owner/admin only. | `{mediaId}`, query `disposition`. | `200 SignedMediaUrl`; short expiry and audit; `EX-READ`. `FR-WARDROBE` |
| MD06 | `DELETE /media/{mediaId}` | Delete asset/unlink reusable media; uploader owner or manager. | `{mediaId}`, query `force:boolean` admin only. | `204`; reject referenced public content unless authorized replacement/archive flow; `EX-ACTION`. `FR-PROFILE-AVATAR, FR-WARDROBE-UPLOAD` |

### Administration — dashboard, users, catalog, inventory, categories, brands, and collections

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| AM01 | `GET /admin/dashboard/summary` | KPI cards; `admin|manager`. | Query `range=day|week|month|custom,from,to`. | `200 DashboardSummary`; `EX-READ`. `N/A (production capability)` |
| AM02 | `GET /admin/dashboard/sales` | Sales/order/time-series report; `admin|manager`. | Query `from,to,groupBy=day|week|month,currency`. | `200 SalesSeries`; `EX-READ`. `N/A` |
| AM03 | `GET /admin/users` | List customers; `admin|support`. | Query `page,limit,search,status,role,createdFrom,createdTo`. | `200 Page<User>`; sensitive fields omitted; `EX-READ`. `N/A` |
| AM04 | `GET /admin/users/{userId}` | Customer detail; `admin|support`. | `{userId}`, query `include=orders,addresses`. | `200 AdminUser`; audit access; `EX-READ`. `N/A` |
| AM05 | `PATCH /admin/users/{userId}` | Change status/role; `admin` only. | `{userId}`, JSON `{status?:UserStatus,role?:Role}`. | `200 AdminUser`; cannot remove last admin or self-escalate; `EX-PATCH`. `N/A` |
| AP01 | `GET /admin/products` | Manage product listing; `catalog_manager`. | Product query params plus `status,include=variants,inventory`. | `200 Page<Product>`; includes drafts; `EX-READ`. `N/A` |
| AP02 | `POST /admin/products` | Create product; `catalog_manager`. | JSON `ProductCreate`; idempotency required. | `201 Product`; slug globally unique; `EX-CREATE`. `N/A` |
| AP03 | `GET /admin/products/{productId}` | Get product including management fields; `catalog_manager`. | `{productId}`, query `include=variants,media,inventory`. | `200 Product`; `EX-READ`. `N/A` |
| AP04 | `PATCH /admin/products/{productId}` | Update product; `catalog_manager`. | `{productId}`, JSON `ProductPatch`. | `200 Product`; archives rather than hard-deletes sold products; `EX-PATCH`. `N/A` |
| AP05 | `POST /admin/products/{productId}/archive` | Archive/unarchive product; `catalog_manager`. | `{productId}`, JSON `{archived:boolean}`. | `200 Product`; active cart lines revalidate; `EX-ACTION`. `N/A` |
| AP06 | `POST /admin/products/{productId}/images` | Attach ready `product_image` media and order it; `catalog_manager`. | `{productId}`, JSON `{mediaId,variantId?:string,alt:{en:string,ar:string},isPrimary?:boolean,displayOrder?:int}`. | `201 ProductImage`; one primary per product/variant; `EX-UPLOAD`. `N/A` |
| AP07 | `PATCH /admin/products/{productId}/images/{imageId}` | Update image metadata/order; `catalog_manager`. | Params, JSON partial AP06. | `200 ProductImage`; `EX-PATCH`. `N/A` |
| AP08 | `DELETE /admin/products/{productId}/images/{imageId}` | Remove image association; `catalog_manager`. | Params. | `204`; publishing requires remaining primary image; `EX-ACTION`. `N/A` |
| AV01 | `POST /admin/products/{productId}/variants` | Create variant; `catalog_manager`. | `{productId}`, JSON `VariantCreate`; idempotency required. | `201 Variant`; SKU/barcode uniqueness; `EX-CREATE`. `N/A` |
| AV02 | `PATCH /admin/products/{productId}/variants/{variantId}` | Update variant; `catalog_manager`. | Params, JSON `VariantPatch`. | `200 Variant`; changes price/current availability; `EX-PATCH`. `N/A` |
| AV03 | `DELETE /admin/products/{productId}/variants/{variantId}` | Archive variant; `catalog_manager`. | Params. | `204`; reject sold/reserved variant hard-delete; `EX-ACTION`. `N/A` |
| AV04 | `GET /admin/products/{productId}/variants/{variantId}/inventory` | Get variant stock; `catalog_manager|fulfillment_manager`. | Params. | `200 Inventory`; `EX-READ`. `N/A` |
| IV01 | `PATCH /admin/inventory/{variantId}` | Set absolute available stock; `fulfillment_manager`. | `{variantId}`, JSON `{quantity:int>=0,reason:string}`; idempotency required. | `200 Inventory`; appends immutable history; `EX-PATCH`. `N/A` |
| IV02 | `POST /admin/inventory/{variantId}/adjustments` | Add/subtract stock; `fulfillment_manager`. | `{variantId}`, JSON `{delta:int!=0,reason:enum|text,reference?:string}`; idempotency required. | `201 InventoryAdjustment`; cannot make available below reservations; `EX-CREATE`. `N/A` |
| IV03 | `GET /admin/inventory/{variantId}/history` | Get stock history; `fulfillment_manager`. | `{variantId}`, query `page,limit,createdFrom,createdTo`. | `200 Page<InventoryAdjustment>`; `EX-READ`. `N/A` |
| IV04 | `GET /admin/inventory/low-stock` | List low/out-of-stock variants; `catalog_manager|fulfillment_manager`. | Query `page,limit,threshold,productId`. | `200 Page<Inventory>`; `EX-READ`. `N/A` |
| IV05 | `POST /admin/inventory/reservations` | Manually reserve stock; `fulfillment_manager`. | JSON `{variantId,quantity:int,expiresAt?,reference}`; idempotency required. | `201 StockReservation`; cannot exceed sellable stock; `EX-CREATE`. `N/A` |
| IV06 | `POST /admin/inventory/reservations/{reservationId}/release` | Release manual/system reservation; `fulfillment_manager`. | `{reservationId}`, JSON `{reason}`. | `200 Inventory`; idempotent; `EX-ACTION`. `N/A` |
| IV07 | `POST /admin/inventory/restore` | Restore stock after cancellation/return; `fulfillment_manager`. | JSON `{orderId?,returnId?,items:[{variantId,quantity}]}`; idempotency required. | `200 Inventory[]`; only once per source transition; `EX-ACTION`. `N/A` |
| AC01 | `GET /admin/categories` | List all category records; `catalog_manager`. | Query `page,limit,parentId,status`. | `200 Page<Category>`; `EX-READ`. `N/A` |
| AC02 | `POST /admin/categories` | Create category/subcategory; `catalog_manager`. | JSON `{slug,parentId?,iconMediaId?,displayOrder?,isActive?,en:{title,description,types},ar:{title,description,types},seo?}`. | `201 Category`; slug unique and no cyclic parent; `EX-CREATE`. `N/A` |
| AC03 | `PATCH /admin/categories/{categoryId}` | Update category; `catalog_manager`. | Params, JSON partial AC02. | `200 Category`; `EX-PATCH`. `N/A` |
| AC04 | `DELETE /admin/categories/{categoryId}` | Archive/delete empty category; `catalog_manager`. | `{categoryId}`, query `mode=archive|delete`. | `204`; reject delete with children/products; `EX-ACTION`. `N/A` |
| AC05 | `POST /admin/categories/reorder` | Reorder sibling categories; `catalog_manager`. | JSON `{parentId?:string,items:[{id:string,displayOrder:int}]}`; idempotency required. | `200 Category[]`; all IDs must be siblings; `EX-ACTION`. `N/A` |
| AC06 | `POST /admin/categories/{categoryId}/activation` | Activate/deactivate category; `catalog_manager`. | Params, JSON `{isActive:boolean}`. | `200 Category`; inactive categories disappear from public browse; `EX-ACTION`. `N/A` |
| AB01–AB07 | `GET|POST /admin/brands`, `GET|PATCH|DELETE /admin/brands/{brandId}`, `POST /admin/brands/reorder`, `POST /admin/brands/{brandId}/activation` | Brand CRUD/reorder/activation; `catalog_manager`. | Create/patch `{slug,name,description?,logoMediaId?,bannerMediaId?,displayOrder?,isActive?,seo?}`; list queries `page,limit,search,status`; explicit ID routes use `{brandId}`. | `200/201/204 Brand`; public logo uses `brand_logo`; cannot delete referenced brand; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AL01–AL07 | `GET|POST /admin/collections`, `GET|PATCH|DELETE /admin/collections/{collectionId}`, `POST /admin/collections/reorder`, `POST /admin/collections/{collectionId}/activation` | Collection CRUD/reorder/activation; `catalog_manager|marketing_manager`. | Create/patch `{slug,en,ar,imageMediaId?,productIds?:string[],startsAt?,endsAt?,displayOrder?,isActive?}`; list query `page,limit,status`. | `200/201/204 Collection`; product membership uses valid active catalog entries; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |

### Administration — orders, payments, shipping, promotions, reviews, notifications, and store settings

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| AO01 | `GET /admin/orders` | List all orders; `support|fulfillment_manager`. | Query `page,limit,search,status,paymentStatus,fulfillmentStatus,createdFrom,createdTo`. | `200 Page<Order>`; `EX-READ`. `N/A` |
| AO02 | `GET /admin/orders/{orderId}` | Order detail; `support|fulfillment_manager`. | `{orderId}`, query `include=customer,payments,shipments,notes`. | `200 Order`; audit access; `EX-READ`. `N/A` |
| AO03 | `PATCH /admin/orders/{orderId}/status` | Update order status; `fulfillment_manager`. | `{orderId}`, JSON `{status:OrderStatus,reason?:string}`; idempotency required. | `200 Order`; legal transitions below; `EX-PATCH`. `N/A` |
| AO04 | `PATCH /admin/orders/{orderId}/payment-status` | Reconcile payment status; `admin|support`. | Params, JSON `{paymentStatus:PaymentStatus,providerReference?,reason}`. | `200 Order`; provider truth takes precedence; `EX-PATCH`. `N/A` |
| AO05 | `PATCH /admin/orders/{orderId}/fulfillment-status` | Update fulfillment/shipment carrier/tracking; `fulfillment_manager`. | Params, JSON `{fulfillmentStatus,shipments?:[{carrier,trackingNumber,items}]}`. | `200 Order`; shipping sends notification; `EX-PATCH`. `N/A` |
| AO06 | `POST /admin/orders/{orderId}/notes` | Add immutable internal note; `support|fulfillment_manager`. | `{orderId}`, JSON `{body:string}`. | `201 AdminNote`; never exposed to customer; `EX-CREATE`. `N/A` |
| APY01 | `POST /admin/payments/{paymentId}/refunds` | Refund captured payment; `admin|support`. | `{paymentId}`, JSON `{amount?:decimal,reason:string}`; idempotency required. | `201 Refund`; amount ≤ refundable balance; update order only after provider result; `EX-CREATE`. `N/A` |
| APY02 | `GET /admin/payments` | Payment reconciliation list; `admin|support`. | Query `page,limit,status,provider,orderId,createdFrom,createdTo`. | `200 Page<Payment>`; `EX-READ`. `N/A` |
| APY03 | `PATCH /admin/payment-methods/{methodCode}` | Configure availability/limits; `admin`. | `{methodCode}`, JSON `{isActive,displayOrder,minAmount?,maxAmount?,countries?}`. | `200 PaymentMethod`; never returns credentials; `EX-PATCH`. `N/A` |
| AS01–AS04 | `GET|POST /admin/shipping/zones`, `PATCH|DELETE /admin/shipping/zones/{zoneId}` | Shipping-zone CRUD; `admin|fulfillment_manager`. | Zone body `{name,countries:string[],regions?:string[],postalCodes?:string[],isActive}`. | `200/201/204 ShippingZone`; zones must not have ambiguous same-priority matches; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AS05–AS08 | `GET|POST /admin/shipping-methods`, `PATCH|DELETE /admin/shipping-methods/{shippingMethodId}` | Shipping-method CRUD; `admin|fulfillment_manager`. | Method body `{code,name,zoneIds,priceRule,freeAbove?,etaMinDays,etaMaxDays,isActive,displayOrder}`. | `200/201/204 ShippingMethod`; rate rule versioned/audited; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AS09 | `GET /admin/shipments` | Shipment work queue; `fulfillment_manager`. | Query `page,limit,status,carrier,orderId`. | `200 Page<Shipment>`; `EX-READ`. `N/A` |
| AS10 | `PATCH /admin/shipments/{shipmentId}` | Update shipment/tracking; `fulfillment_manager`. | `{shipmentId}`, JSON `{carrier?,trackingNumber?,status?,estimatedDeliveryAt?}`. | `200 Shipment`; carrier status mapping audited; `EX-PATCH`. `N/A` |
| CP01–CP05 | `GET|POST /admin/coupons`, `GET|PATCH|DELETE /admin/coupons/{couponId}` | Coupon CRUD; `marketing_manager`. | Coupon body `{code,discountType,amount,startsAt,endsAt,usageLimit?,perCustomerLimit?,minimumSubtotal?,applicableProductIds?,applicableCategoryIds?,isActive}`. | `200/201/204 Coupon`; no overlapping incompatible coupon rules; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| CP06 | `POST /admin/coupons/{couponId}/activation` | Activate/deactivate coupon; `marketing_manager`. | `{couponId}`, JSON `{isActive:boolean}`. | `200 Coupon`; `EX-ACTION`. `N/A` |
| PM01–PM05 | `GET|POST /admin/promotions`, `GET|PATCH|DELETE /admin/promotions/{promotionId}` | Promotion CRUD; `marketing_manager`. | Promotion body `{name,type,priority,stackingRule,conditions,benefits,startsAt,endsAt,isActive}`. | `200/201/204 Promotion`; deterministic priority/stacking; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| PM06 | `POST /admin/promotions/{promotionId}/activation` | Activate/deactivate promotion; `marketing_manager`. | Params, JSON `{isActive:boolean}`. | `200 Promotion`; `EX-ACTION`. `N/A` |
| AR01 | `GET /admin/reviews` | Moderate review list; `support|catalog_manager`. | Query `page,limit,status,rating,productId,createdFrom`. | `200 Page<Review>`; `EX-READ`. `N/A` |
| AR02 | `POST /admin/reviews/{reviewId}/approve` | Approve review; `support|catalog_manager`. | `{reviewId}`, JSON `{note?:string}`. | `200 Review`; rating summary recomputed; `EX-ACTION`. `N/A` |
| AR03 | `POST /admin/reviews/{reviewId}/reject` | Reject review; `support|catalog_manager`. | `{reviewId}`, JSON `{reason:string}`. | `200 Review`; author may receive safe reason; `EX-ACTION`. `N/A` |
| AR04 | `DELETE /admin/reviews/{reviewId}` | Moderate-remove review; `support|catalog_manager`. | `{reviewId}`, JSON `{reason:string}`. | `204`; audit record retained; `EX-ACTION`. `N/A` |
| AN01 | `GET /admin/notifications` | Notification/campaign history; `marketing_manager|support`. | Query `page,limit,type,status,userId,createdFrom`. | `200 Page<Notification>`; `EX-READ`. `N/A` |
| AN02 | `POST /admin/notifications` | Send scoped notification/campaign; `marketing_manager|support`. | JSON `{audience:{userIds?:string[],segment?:string},type,title,body,channels:email|push|in_app[],scheduleAt?}`; idempotency required. | `202 NotificationCampaign`; marketing consent enforced; `EX-CREATE`. `N/A` |
| AN03 | `POST /admin/notifications/{notificationId}/resend` | Resend permitted transactional message; `support`. | `{notificationId}`. | `202`; rate/audit constrained; `EX-ACTION`. `N/A` |
| ST01 | `GET /admin/settings` | Store settings; `admin`. | Query `section=general|tax|seo|checkout`. | `200 StoreSettings`; secrets omitted; `EX-READ`. `N/A` |
| ST02 | `PATCH /admin/settings` | Update store settings; `admin`. | JSON partial `{storeName,defaultCurrency,supportedCurrencies,defaultLocale,taxSettings,seo,orderNumberPrefix}`. | `200 StoreSettings`; version/audit changes; `EX-PATCH`. `N/A` |

### Administration — home content, editorial, Saved Wardrobe configuration, and body zones

| ID | Method and final endpoint | Purpose / access / ownership | Input | Result, business rules, example / trace |
| --- | --- | --- | --- | --- |
| AH01–AH05 | `GET|POST /admin/banners`, `GET|PATCH|DELETE /admin/banners/{bannerId}` | Promotional banner CRUD; `marketing_manager`. | Body `{slug,placement,imageDesktopMediaId,imageMobileMediaId?,alt:{en,ar},cta:{label:{en,ar},url},displayOrder,isActive,startsAt?,endsAt?}`. | `200/201/204 Banner`; media purpose `home_banner`; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AH06–AH10 | `GET|POST /admin/heroes`, `GET|PATCH|DELETE /admin/heroes/{heroId}` | Hero-slide CRUD; `marketing_manager`. | Body `{slug,imageDesktopMediaId,imageMobileMediaId?,imageAlt:{en,ar},overlayOpacity:0..1,theme?,displayOrder,isActive,startsAt?,endsAt?,en,ar}`. | `200/201/204 Hero`; validates time windows and primary assets; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AH11 | `POST /admin/home/sections/reorder` | Reorder home sections; `marketing_manager`. | JSON `{items:[{id,displayOrder}]}`; idempotency required. | `200 HomeSection[]`; `EX-ACTION`. `N/A` |
| AH12 | `PATCH /admin/home/sections/{sectionId}` | Configure active home section; `marketing_manager`. | `{sectionId}`, JSON `{isActive?,content?,startsAt?,endsAt?,displayOrder?}`. | `200 HomeSection`; references active catalog/content only; `EX-PATCH`. `N/A` |
| AH13–AH17 | `GET|POST /admin/lookbooks`, `GET|PATCH|DELETE /admin/lookbooks/{lookbookId}` | Lookbook CRUD; `marketing_manager`. | Body `{slug,imageMediaId,imageAlt:{en,ar},displayOrder,isActive,en,ar,hotspots:[{id,desktop,mobile?,bodyZoneSlug?,categoryId?,subcategoryId?,type?}]}`. | `200/201/204 Lookbook`; validates all mappings and 0–100 coordinates; `EX-READ/CREATE/PATCH/ACTION`. `FR-LOOKBOOK` |
| AH18–AH22 | `GET|POST /admin/testimonials`, `GET|PATCH|DELETE /admin/testimonials/{testimonialId}` | Testimonial CRUD; `marketing_manager`. | Body `{rating:1..5,isActive,en:{quote,author,role},ar:{quote,author,role}}`. | `200/201/204 Testimonial`; only consented customer stories may publish; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AE01–AE05 | `GET|POST /admin/blog-posts`, `GET|PATCH|DELETE /admin/blog-posts/{postId}` | Editorial CRUD; `marketing_manager`. | Body localized title/excerpt/content, `slug,author,authorImageMediaId?,coverMediaId,category,tags,relatedProductIds,status,featured,publishedAt?,seo`. | `200/201/204 BlogPost`; HTML sanitized, related products checked; `EX-READ/CREATE/PATCH/ACTION`. `N/A` |
| AW01 | `GET /admin/wardrobe/configuration` | Read allowed wardrobe metadata/config; `admin`. | No body. | `200 WardrobeConfiguration`; `EX-READ`. `N/A` |
| AW02 | `PATCH /admin/wardrobe/configuration` | Configure allowed categories/colors/tag policy/limits; `admin`. | JSON `{categories?:string[],colors?:string[],maxTags?:int,maxUploadBytes?:int,allowedSeasons?:Season[]}`. | `200 WardrobeConfiguration`; does not disclose private items; `EX-PATCH`. `N/A` |
| AZ01 | `GET /admin/body-zones` | List active/inactive zone configurations; `catalog_manager|marketing_manager`. | Query `page,limit,isActive,search,sortBy=displayOrder|slug`. | `200 Page<BodyZone>`; `EX-READ`. `N/A` |
| AZ02 | `POST /admin/body-zones` | Create body zone; `catalog_manager|marketing_manager`. | JSON `BodyZoneCreate`; idempotency required. | `201 BodyZone`; validates supported zone/slug/hotspot keys; `EX-CREATE`. `N/A` |
| AZ03 | `GET /admin/body-zones/{bodyZoneId}` | Get management body zone; roles above. | `{bodyZoneId}`. | `200 BodyZone`; `EX-READ`. `N/A` |
| AZ04 | `PATCH /admin/body-zones/{bodyZoneId}` | Update labels/assets/hotspots; roles above. | Params, JSON `BodyZonePatch`. | `200 BodyZone`; `labels.en` and `labels.ar` editable, desktop/mobile coordinates are 0–100; `EX-PATCH`. `N/A` |
| AZ05 | `DELETE /admin/body-zones/{bodyZoneId}` | Delete/archival action; `catalog_manager`. | `{bodyZoneId}`, query `mode=archive|delete`. | `204`; hard delete only with no mappings/products; `EX-ACTION`. `N/A` |
| AZ06 | `POST /admin/body-zones/{bodyZoneId}/activation` | Activate/deactivate; roles above. | Params, JSON `{isActive:boolean}`. | `200 BodyZone`; inactive zones hidden publicly but mappings retained; `EX-ACTION`. `N/A` |
| AZ07 | `POST /admin/body-zones/reorder` | Reorder zones; roles above. | JSON `{items:[{id,displayOrder}]}`; idempotency required. | `200 BodyZone[]`; no duplicates; `EX-ACTION`. `N/A` |
| AZ08 | `POST /admin/body-zones/{bodyZoneId}/category-mappings` | Assign category/subcategory mapping; roles above. | Params, JSON `{categoryId:string,subcategoryId?:string,displayOrder?:int}`. | `201 BodyZoneMapping`; unique zone/category/subcategory; `EX-CREATE`. `N/A` |
| AZ09 | `DELETE /admin/body-zones/{bodyZoneId}/category-mappings/{mappingId}` | Remove mapping; roles above. | Params. | `204`; `EX-ACTION`. `N/A` |
| AZ10 | `PATCH /admin/body-zones/{bodyZoneId}/hotspot` | Manage SVG key and desktop/mobile coordinates; roles above. | Params, JSON `{svgRegionKey:string,desktop:{x,y,width,height},mobile?:{x,y,width,height},hotspotIdentifier:string}`. | `200 BodyZoneHotspot`; coordinates all 0–100 and map to a unique zone; `EX-PATCH`. `N/A` |
| AZ11 | `POST /admin/body-zones/{bodyZoneId}/assets` | Attach ready icon/illustration asset; roles above. | Params, JSON `{mediaId:string,role:icon|overlay|illustration}`. | `201 BodyZoneAsset`; asset uses `body_zone_asset`; `EX-UPLOAD`. `N/A` |
| AZ12 | `DELETE /admin/body-zones/{bodyZoneId}/assets/{assetId}` | Remove body-zone asset link; roles above. | Params. | `204`; `EX-ACTION`. `N/A` |
| AMD01 | `GET /admin/media` | Search/manage media library; `catalog_manager|marketing_manager|admin`. | Query `page,limit,purpose,status,ownerId,createdFrom,createdTo`. | `200 Page<Media>`; private access audited; `EX-READ`. `N/A` |

## Order status transition policy

The backend—not the Angular screen—enforces these transitions. `pending_payment → confirmed` occurs only after payment authorization/capture or approved COD flow. `confirmed → processing → shipped → delivered` is forward-only. `pending_payment|confirmed|processing → cancelled` is allowed before shipment, releases reservation/restores inventory as applicable, and triggers payment void/refund. `delivered → return_requested → returned → refunded` is the normal return path. `confirmed|processing → refunded` is only an authorized cancellation/refund path. `shipped` cannot be customer-cancelled. `cancelled`, `refunded`, and `returned` are terminal except an admin correction with an audited compensating operation. Payment transitions are `pending → authorized → paid`, `pending|authorized → failed`, and `paid → partially_refunded|refunded`; fulfillment transitions are `unfulfilled → processing → partially_fulfilled|fulfilled`, with return/cancel terminal branches.

## Frontend traceability

| Reference | Exact inspected files and related methods/components |
| --- | --- |
| `FR-AUTH-REGISTER` | `src/app/features/auth/register/register.ts` (`Register.registerForm`, `AuthStore.signUp`); `src/app/core/services/auth.service.ts` (`register`). |
| `FR-AUTH-LOGIN` | `src/app/features/auth/login/login.ts` (`Login.loginForm`, `AuthStore.login`); `src/app/features/auth/email-check/email-check.ts` (`onContinue`, `checkEmail`); `src/app/core/services/auth.service.ts` (`login`, `checkEmailExists`). |
| `FR-AUTH-FORGOT` | `src/app/features/auth/forget-password/forgot-password.ts` (`ForgotPassword.forgotPasswordForm`); simulated today, mapped to AU08/AU09. |
| `FR-AUTH-SESSION` / `FR-AUTH-LOGOUT` | `src/app/features/auth/auth.store.ts` (`logOut`, initialization); `src/app/core/services/auth-session.service.ts`; `src/app/core/interceptors/auth.interceptor.ts`. |
| `FR-PROFILE` / `FR-PROFILE-AVATAR` | `src/app/features/user/pages/profile/profile-page.ts` (`saveProfile`, `onImageSelected`, `uploadStandaloneImage`); `src/app/features/auth/auth.store.ts` (`updateProfile`); `src/app/core/services/auth.service.ts` (`updateUser`). |
| `FR-SETTINGS` | `src/app/features/user/pages/settings/settings-page.ts` (`setLanguage`, `setCurrency`, `toggleNotifications`); `src/app/core/stores/preferences.store.ts`; `AuthStore.savePreferences`/`syncPreferencesFromStore`. |
| `FR-SHOP` | `src/app/features/user/pages/shop/pages/shop-page/shop-page.ts`; `src/app/features/user/pages/shop/shop.store.ts` (`loadProducts`, `loadPriceBounds`); `src/app/core/services/product.service.ts` (`getProductsPage`, `getPriceBounds`). |
| `FR-HEADER-SEARCH` | `src/app/layouts/header/header.ts` (`onSearchInput`, `searchAll`, `goToProduct`); `ProductService.searchProducts`. |
| `FR-PRODUCT-DETAIL` | `src/app/features/user/pages/shop/pages/product-detail-page/product-detail-page.ts` (`_loadProductBySlug`, `selectSku`, `addToCart`, `toggleWishlist`, `saveToWardrobe`); `ProductService`. |
| `FR-CATEGORIES` | `src/app/features/user/pages/categories/pages/category-list/category-list.ts`; `src/app/features/user/pages/categories/category.store.ts`; `src/app/core/services/category.service.ts`. |
| `FR-HOME` / `FR-HERO` | `src/app/features/user/pages/home/home.ts` (`ngOnInit`, hero and featured-product signals); `hero.service.ts`, `testimonial.service.ts`, `category.service.ts`, `product.service.ts`. |
| `FR-LOOKBOOK` / `FR-BODY-ZONE` | `src/app/features/user/pages/home/home.ts` (`hotspots`, `fallbackHotspots`); `src/app/core/services/lookbook.service.ts`; `public/assets/images/interactive-models.svg`. Body-zone endpoints supersede component-held hot-spot filtering as production configuration. |
| `FR-BLOG` / `FR-BLOG-DETAIL` | `src/app/features/user/pages/blog/blog-page.ts`; `src/app/features/user/pages/blog/blog-detail/blog-detail.ts` (`loadBlog`); `src/app/core/services/blog.service.ts`. |
| `FR-NEWSLETTER` | `src/app/features/user/pages/home/home.html` and `src/app/layouts/footer/footer.html` email inputs (currently unwired). |
| `FR-WISHLIST` | `src/app/features/user/pages/wishlist/pages/wishlist-page/wishlist-page.ts` (`moveToCart`, `removeFromWishlist`); `src/app/core/stores/wishlist.store.ts` (local storage mock). |
| `FR-CART` | `src/app/features/user/pages/cart/pages/cart-page/cart-page.ts`; `src/app/core/stores/cart.store.ts` (`addToCart`, `updateQuantity`, `clearCart`; local totals/shipping replaced by backend). |
| `FR-CHECKOUT` | `src/app/features/user/pages/checkout/pages/checkout-page/checkout-page.ts` (`checkoutForm`, `placeOrder`; simulated today); `src/app/core/services/order.service.ts` (`placeOrder`). |
| `FR-ORDERS` | `src/app/features/user/pages/orders/orders-page.ts` (`ngOnInit`, `toggleOrder`); `src/app/core/services/order.service.ts`. |
| `FR-RECENT` | `src/app/features/user/pages/recently-viewed/pages/recently-viewed-page/recently-viewed-page.ts`; `src/app/core/stores/recently-viewed.store.ts` (local storage mock). |
| `FR-WARDROBE` / `FR-WARDROBE-SAVE` | `src/app/features/user/wardrobe/wardrobe-page.component.ts`; `src/app/features/user/wardrobe/components/wardrobe-item-card/wardrobe-item-card.component.ts`; `src/app/core/stores/wardrobe.store.ts` (`load`, `addProduct`, `remove`, `update`). |
| `FR-WARDROBE-UPLOAD` | `src/app/features/user/wardrobe/components/wardrobe-upload-panel/wardrobe-upload-panel.component.ts` (`onFileSelected`, `save` TODO); `src/app/core/services/wardrobe.service.ts` (`addMockUploadedImage` TODO). |
| `FR-HEADER` | `src/app/layouts/header/header.ts`; badges currently read local stores and should hydrate from customer resources. |
