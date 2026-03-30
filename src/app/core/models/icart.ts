// src/app/core/models/cart.model.ts

import { Sku } from './icatalog';
import { User } from './iuser';

/**
 * 🛒 عنصر في عربة التسوق (Cart Item)
 * يربط بين السلة ونسخة المنتج المحددة (SKU) مع الكمية المطلوبة
 */
export interface CartItem {
  id: number;
  quantity: number;
  cartId: number;
  skuId: number;

  // -- العلاقات (Relations) --
  // سنحتاج الـ SKU هنا لكي نعرض صورة المنتج الفرعية، السعر، والخصائص المحددة (مثل: أحمر، L)
  sku?: Sku;

  // -- حقول مساعدة للواجهة (Computed Frontend Fields) --
  // إجمالي سعر هذا العنصر (الكمية × سعر الـ SKU بعد الخصم)
  subTotal?: number;
}

/**
 * 🛍️ عربة التسوق الرئيسية (Cart)
 * تمثل سلة المستخدم الحالية أو السابقة
 */
export interface Cart {
  id: number;
  isFinished: boolean; // هل تم تحويلها لطلب (Order) أم ما زالت نشطة؟
  userId: number;
  createdAt: string;
  updatedAt: string;

  // -- العلاقات (Relations) --
  user?: User;
  items?: CartItem[]; // قائمة العناصر الموجودة داخل السلة

  // -- حقول مساعدة للواجهة (Computed Frontend Fields) --
  // غالباً الباك إند (DRF) سيقوم بحسابها وإرسالها لتخفيف الحمل على المتصفح
  totalItems?: number; // إجمالي عدد القطع (مجموع الـ quantities)
  totalPrice?: number; // السعر الإجمالي قبل الخصم
  finalPrice?: number; // السعر النهائي بعد تطبيق أي كوبونات عامة على السلة
}
