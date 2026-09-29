import { ProductCardModel } from '../services/product.service';

export type WardrobeItemType = 'product' | 'upload';

export interface WardrobeItem {
  id: string;
  userId?: string | number;
  type: WardrobeItemType;

  productId?: string | number;
  product?: ProductCardModel;

  imageUrl?: string;
  title?: string;
  note?: string;

  createdAt: string;
}
