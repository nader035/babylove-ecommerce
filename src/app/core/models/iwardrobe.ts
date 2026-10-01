import { ProductCardModel } from '../services/product.service';

// ── Clothing types that auto-materialize into wardrobe shelves ──────────────
export type ClothingType =
  | 'shirts'
  | 'pants'
  | 'dresses'
  | 'outerwear'
  | 'knitwear'
  | 'footwear'
  | 'bags'
  | 'accessories'
  | 'loungewear'
  | 'denim'
  | 'other';

export const CLOTHING_TYPES: ClothingType[] = [
  'shirts',
  'pants',
  'dresses',
  'outerwear',
  'knitwear',
  'footwear',
  'bags',
  'accessories',
  'loungewear',
  'denim',
  'other',
];

// ── Three sources for wardrobe items ────────────────────────────────────────
export type WardrobeItemSource = 'product' | 'upload' | 'symbol';

// ── Clothing symbol identifiers (maps to inline Tabler SVG icons) ───────────
export type ClothingSymbol =
  | 'shirt'
  | 'pants'
  | 'dress'
  | 'jacket'
  | 'shoe'
  | 'sock'
  | 'tie'
  | 'hanger'
  | 'bag'
  | 'scarf'
  | 'hat';

export const CLOTHING_SYMBOLS: ClothingSymbol[] = [
  'shirt',
  'pants',
  'dress',
  'jacket',
  'shoe',
  'sock',
  'tie',
  'hanger',
  'bag',
  'scarf',
  'hat',
];

// ── Color metadata ──────────────────────────────────────────────────────────
export interface WardrobeItemColor {
  name: string;
  hex?: string;
}

// ── Denormalized product snapshot for display without re-fetching ────────────
export interface ProductSnapshot {
  slug: string;
  price: number;
  categorySlug: string;
  image: string;
  en: { title: string };
  ar: { title: string };
}

// ── The unified wardrobe item ───────────────────────────────────────────────
export interface WardrobeItem {
  id: string;
  userId: string;
  clothingType: ClothingType;
  source: WardrobeItemSource;

  // Display
  name: string;
  color?: WardrobeItemColor;
  size?: string;
  notes?: string;

  // Source-specific fields
  productId?: string | number;         // source: 'product'
  imageUrl?: string;                   // source: 'upload' or resolved from product
  symbol?: ClothingSymbol;             // source: 'symbol'
  productSnapshot?: ProductSnapshot;   // source: 'product' — denormalized for display

  createdAt: string;
  updatedAt?: string;
}

// ── A shelf is a computed grouping — NOT persisted ──────────────────────────
export interface WardrobeShelf {
  clothingType: ClothingType;
  items: WardrobeItem[];
}

// ── Mapping from product type to clothing type ──────────────────────────────
const PRODUCT_TYPE_MAP: Record<string, ClothingType> = {
  shirts: 'shirts',
  pants: 'pants',
  dresses: 'dresses',
  outerwear: 'outerwear',
  knitwear: 'knitwear',
  footwear: 'footwear',
  bags: 'bags',
  accessories: 'accessories',
  lounge: 'loungewear',
  loungewear: 'loungewear',
  denim: 'denim',
  basics: 'shirts',
  separates: 'pants',
  jewelry: 'accessories',
};

export function productTypeToClothingType(productType: string): ClothingType {
  return PRODUCT_TYPE_MAP[productType.toLowerCase()] ?? 'other';
}

// ── Helper to create a product snapshot from ProductCardModel ────────────────
export function createProductSnapshot(product: ProductCardModel): ProductSnapshot {
  return {
    slug: product.slug,
    price: product.price,
    categorySlug: product.categorySlug,
    image: product.image,
    en: { title: product.en.title },
    ar: { title: product.ar.title },
  };
}
