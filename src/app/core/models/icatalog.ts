// src/app/core/models/catalog.model.ts

import { User } from './iuser';

/**
 * 🏷️ القسم (Category)
 */
export interface CategoryContent {
  title: string;
  description: string;
  types: string[];
}

export interface Category {
  [key: string]: any;
  id: number | string;
  slug: string;
  icon: string;
  parentId?: number | string | null;
  en: CategoryContent;
  ar: CategoryContent;
}

/**
 * 📦 الخصائص (Properties)
 * مثال: اللون، المقاس، الخامة
 */
export interface Property {
  id: number;
  title: string; // مثال: Color
  slug: string;
  attributes?: PropertyAttribute[]; // القيم المتاحة لهذه الخاصية
}

/**
 * 🎛️ قيم الخصائص (Property Attributes)
 * مثال: أحمر، أزرق، XL، Cotton
 */
export interface PropertyAttribute {
  id: number;
  attributeValue: string; // مثال: "Red" أو "XL"
  relatedPropertyId: number;
  property?: Property;
}

/**
 * 🖼️ صور الـ SKU (صور المتغيرات)
 */
export interface SkuImage {
  id: number | string;
  image: string; // رابط الصورة (URL)
  skuId: number | string;
  url?: string;
  isPrimary?: boolean;
}

/**
 * 🔖 وحدة حفظ المخزون (SKU - Stock Keeping Unit)
 * هذا يمثل "النسخة" الفعلية من المنتج (مثال: تيشيرت أحمر مقاس L)
 */
export interface Sku {
  id: number | string;
  code: string; // الكود الفريد للمنتج في المخزن
  skuCode?: string;
  price: number;
  quantity: number;
  productId: number | string;
  currency?: string;
  isInStock?: boolean;
  isActive?: boolean;
  images?: SkuImage[]; // صور هذه النسخة المحددة
  attributes?: PropertyAttribute[]; // الخصائص المربوطة (أحمر، L) - (مبنية من جدول sku_property)
}

/**
 * 💸 الخصم (Discount)
 */
export interface Discount {
  id: number | string;
  title: string;
  discountValue: number;
  discountType: 'percentage' | 'fixed'; // نسبة مئوية أو رقم ثابت
  startDate: string; // ISO Date String
  endDate: string; // ISO Date String
  productId: number | string;
}

/**
 * ⭐ التقييم (Review)
 */
export interface Review {
  id: number | string;
  rate: number; // تقييم من 1 لـ 5
  text: string;
  userId: number | string;
  user?: User; // لعرض اسم وصورة صاحب التقييم
  skuId: number | string;
  createdAt: string;
}

export interface ProductContent {
  title: string;
  shortDescription: string;
  longDescription: string;
}

/**
 * 🛍️ المنتج الأساسي (Product)
 * يمثل الكيان العام (مثال: تيشيرت بولو سادة) وتحته تندرج الـ SKUs
 */
export interface Product {
  [key: string]: any;
  id: number | string;
  slug: string;
  thumbnail: string; // الصورة الرئيسية المصغرة للمنتج
  categoryId: number | string;
  category?: Category;
  type: string;
  typeKey?: string;
  en: ProductContent;
  ar: ProductContent;
  status?: 'draft' | 'active' | 'archived';
  isPublished?: boolean;
  isInStock?: boolean;
  currency?: string;
  reviewCount?: number;
  brand?: string;
  material?: string;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdAt?: string;
  updatedAt?: string;

  // -- علاقات (Relations) ستأتي متداخلة من الباك إند --
  skus?: Sku[]; // كل النسخ المتاحة من المنتج (ألوان ومقاسات)
  discount?: Discount; // الخصم الحالي المطبق إن وجد
  reviews?: Review[]; // تقييمات المنتج

  // -- تجهيزاً لتعديل محمود القادم (صور المنتج العامة) --
  images?: string[]; // أو ممكن تكون interface خاصة بها لو كانت في جدول منفصل

  // حقول مساعدة للـ Frontend (حسابات نقوم بها في الـ UI)
  minPrice?: number; // أقل سعر متاح في الـ SKUs
  maxPrice?: number; // أعلى سعر متاح في الـ SKUs
  totalQuantity?: number; // إجمالي الكمية المتاحة من كل الـ SKUs
}
