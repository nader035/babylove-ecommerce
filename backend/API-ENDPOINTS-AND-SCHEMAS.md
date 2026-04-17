# BabyLove Website API Contract (Complete)

This document defines the full API contract needed by the BabyLove website, not only catalog pages.

It covers:

- users and account preferences
- categories and products
- orders and checkout
- blogs and related products
- testimonials
- heroes and lookbooks
- admin operations and validation rules

## 1) Runtime Modes

## 1.1 Mock Runtime (current project)

The frontend currently uses json-server with `backend/db.json`.

- Base URL: `http://localhost:3000`
- IDs can be either strings or numbers (frontend now supports both)
- Filtering is query-string based (`?field=value`)

## 1.2 Target API Runtime (production design)

Recommended base URL:

- `/api/v1`

Recommended response envelope:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Recommended error envelope:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "price_lte must be greater than or equal to price_gte",
    "details": []
  }
}
```

## 2) Canonical Rules

- `typeKey` is the canonical product type for filtering.
- `type` is kept as a backward-compatible alias.
- `categorySlug` and `typeKey` are language-agnostic.
- Localized labels come from `en` and `ar` payload blocks.
- Every content entity should have `createdAt` and `updatedAt` timestamps.
- Active storefront content should be filtered by `isActive=true` or `status=published`.

## 3) Schemas

The following JSON Schemas define the full db contract:

- `backend/schemas/db.schema.json` (aggregate root)
- `backend/schemas/user.schema.json`
- `backend/schemas/category.schema.json`
- `backend/schemas/product.schema.json`
- `backend/schemas/sku.schema.json`
- `backend/schemas/order.schema.json`
- `backend/schemas/blog.schema.json`
- `backend/schemas/testimonial.schema.json`
- `backend/schemas/hero.schema.json`
- `backend/schemas/lookbook.schema.json`

## 4) Public Storefront Endpoints

## 4.1 Home Content

### Heroes

- `GET /heroes?isActive=true&_sort=displayOrder&_order=asc`

### Lookbooks

- `GET /lookbooks?isActive=true&_sort=displayOrder&_order=asc&_limit=1`

### Testimonials

- `GET /testimonials?isActive=true`

### Blogs (published only)

- `GET /blogs?status=published&_sort=publishedAt&_order=desc`
- `GET /blogs?slug={slug}&status=published`
- `GET /blogs/{id}`

## 4.2 Catalog

### Categories

- `GET /categories`
- `GET /categories?isActive=true&_sort=displayOrder&_order=asc`
- `GET /categories/{id}`
- `GET /categories?slug={slug}`

### Products (shop grid)

- `GET /products?_expand=category`
- `GET /products?_expand=category&_page={page}&_limit={limit}`
- `GET /products?_expand=category&categorySlug={categorySlug}`
- `GET /products?_expand=category&typeKey={typeKey}`
- `GET /products?_expand=category&type={typeKey}`
- `GET /products?_expand=category&price_gte={min}&price_lte={max}`
- `GET /products?_expand=category&q={search}`
- `GET /products?_expand=category&_sort=price&_order=asc`
- `GET /products?_expand=category&_sort=price&_order=desc`
- `GET /products?_expand=category&_sort=rating&_order=desc`

### Product Detail + Related

- `GET /products?slug={slug}&_expand=category`
- `GET /products?id={id}&_expand=category`
- `GET /products?categoryId={categoryId}&_expand=category` (for related products)

## 4.3 Orders

- `GET /orders?userId={userId}&_sort=date&_order=desc`
- `GET /orders/{id}`
- `POST /orders`
- `PATCH /orders/{id}`
- `GET /orders?status={pending|processing|shipped|delivered|cancelled}`

`orders.items[]` includes `productId`, `skuId`, `lineTotal`, and localized title.

## 4.4 Auth and Account

### Email Availability

- `GET /users?email={email}`

### Login (mock mode)

- `GET /users?email={email}&password={password}`

### Register

- `POST /users`

### User Updates

- `PATCH /users/{id}`
- `PATCH /users/{id}` with `{ "preferences": { ... } }`
- `PATCH /users/{id}` with `{ "addresses": [ ... ] }`

## 5) Admin and CMS Endpoints (target design)

Recommended production endpoints:

- `POST /admin/categories`
- `PATCH /admin/categories/{id}`
- `DELETE /admin/categories/{id}`
- `POST /admin/products`
- `PATCH /admin/products/{id}`
- `DELETE /admin/products/{id}`
- `POST /admin/products/{id}/skus`
- `PATCH /admin/skus/{id}`
- `DELETE /admin/skus/{id}`
- `POST /admin/orders/{id}/status-transitions`
- `POST /admin/blogs`
- `PATCH /admin/blogs/{id}`
- `DELETE /admin/blogs/{id}`
- `POST /admin/heroes`
- `PATCH /admin/heroes/{id}`
- `POST /admin/lookbooks`
- `PATCH /admin/lookbooks/{id}`
- `POST /admin/testimonials`
- `PATCH /admin/testimonials/{id}`

## 6) Frontend Query Recipes (Implemented)

### Shop list

```http
GET /products?_expand=category&_page=1&_limit=12&categorySlug=menswear&typeKey=outerwear&type=outerwear&price_gte=100&price_lte=500&_sort=rating&_order=desc
```

### Search suggestions

```http
GET /products?_expand=category&q=linen&_page=1&_limit=5&_sort=rating&_order=desc
```

### Price bounds

```http
GET /products?_expand=category&categorySlug=menswear&typeKey=outerwear&type=outerwear&_page=1&_limit=1&_sort=price&_order=asc
GET /products?_expand=category&categorySlug=menswear&typeKey=outerwear&type=outerwear&_page=1&_limit=1&_sort=price&_order=desc
```

### Blog detail related products

```http
GET /blogs?slug=art-of-modern-tailoring&status=published
GET /products?id=101&_expand=category
GET /products?id=103&_expand=category
```

## 7) Index and Performance Recommendations

Recommended indexes for production DB:

- `users.email` (unique)
- `categories.slug` (unique)
- `categories.displayOrder`
- `products.slug` (unique)
- `products.categorySlug`
- `products.typeKey`
- `products.status`
- `products.isPublished`
- `products.price`
- `products.rating`
- `orders.userId`
- `orders.status`
- `orders.date`
- `blogs.slug` (unique)
- `blogs.status`
- `blogs.publishedAt`
- `heroes.isActive`
- `heroes.displayOrder`
- `lookbooks.isActive`
- `lookbooks.displayOrder`
- full-text index on `products.en.title`, `products.ar.title`, `products.tags`, `blogs.en.title`, `blogs.ar.title`

## 8) Validation Workflow

- Validate `backend/db.json` against `backend/schemas/db.schema.json`.
- Validate each resource payload against its own schema before write operations.
- Reject writes that break canonical rules (`typeKey`, timestamps, status enums).
- Keep `updatedAt` refreshed on every mutation.
