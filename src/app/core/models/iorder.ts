// src/app/core/models/order.model.ts

import { Sku } from "./icatalog";
import { User, Address } from "./iuser";



/**
 * 🏷️ حالات الطلب الممكنة (Order Status)
 * هذه الأنواع ستساعدنا جداً في الـ HTML لعرض أيقونات أو ألوان مختلفة (مثلاً: الأخضر للـ delivered)
 */
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

/**
 * 💳 حالات الدفع وطرق الدفع (Payment Status & Methods)
 */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'paypal' | 'cash_on_delivery' | 'apple_pay';

/**
 * 📦 عنصر داخل الطلب (Order Item)
 * مشابه للـ CartItem ولكنه ثابت لا يتغير بعد تأكيد الطلب
 */
export interface OrderItem {
  id: number;
  quantity: number;
  orderId: number;
  skuId: number;

  // -- العلاقات (Relations) --
  sku?: Sku; // لعرض صورة المنتج واسمه وخصائصه في شاشة تفاصيل الطلب

  // -- حقول مساعدة للواجهة --
  priceAtPurchase?: number; // يفضل دائماً تخزين السعر وقت الشراء تحسباً لتغير سعر الـ SKU لاحقاً
  subTotal?: number;
}

/**
 * 💳 تفاصيل عملية الدفع (Payment Detail)
 */
export interface PaymentDetail {
  id: number;
  amount: number;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 🚚 الطلب النهائي (Order)
 */
export interface Order {
  id: number;
  status: OrderStatus;
  trackingCode: string | null; // كود تتبع الشحنة
  addressId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;

  // -- العلاقات المتداخلة (Nested Relations) --
  // سيقوم الباك إند بإرسالها في شاشة (Order History) أو (Order Details)
  user?: User;
  address?: Address; // عنوان الشحن الذي تم اختياره لهذا الطلب
  items?: OrderItem[]; // قائمة المنتجات المشتراة
  paymentDetails?: PaymentDetail[]; // عمليات الدفع المرتبطة بالطلب

  // -- حقول مساعدة للواجهة (Computed Frontend Fields) --
  totalAmount?: number; // إجمالي قيمة الطلب
  itemCount?: number; // عدد القطع الإجمالي
}
