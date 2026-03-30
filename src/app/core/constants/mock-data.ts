// ==========================================
// 1. Interfaces
// ==========================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  creationAt: string;
  updatedAt: string;
}

export interface Product {
  id: number;
  title: string;
  slug: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
  creationAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Mock Data - Categories
// ==========================================

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Women',
    slug: 'women',
    image: 'https://kiabi.eg/cdn/shop/files/BENTO-SMALL-min.jpg?v=1764150634', // الصور اللي في الصورة عندك
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Girl',
    slug: 'girl',
    image: 'https://kiabi.eg/cdn/shop/files/BENTO-BIG-min.jpg?v=1764150634',
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Men',
    slug: 'men',
    image: 'https://kiabi.eg/cdn/shop/files/BENTO-SMALL-3-min.jpg?v=1764150634',
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Plus size',
    slug: 'plus-size',
    image: 'https://kiabi.eg/cdn/shop/files/BENTO-BIG-2-min.jpg?v=1764150634',
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'Boy',
    slug: 'boy',
    image: 'https://kiabi.eg/cdn/shop/files/BENTO-SMALL-1-min.jpg?v=1764150634',
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Baby',
    slug: 'baby',
    image: 'https://kiabi.eg/cdn/shop/files/BENTO-SMALL-4-min.jpg?v=1764150634',
    creationAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ==========================================
// 3. Mock Data - Products
// ==========================================

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 645,
    title: 'Classic Black Hooded Sweatshirt',
    slug: 'classic-black-hooded-sweatshirt',
    price: 79,
    description:
      'Elevate your casual wardrobe with our Classic Black Hooded Sweatshirt. Made from high-quality, soft fabric that ensures comfort and durability...',
    category: {
      id: 110,
      name: 'Clothes',
      slug: 'clothes',
      image: 'https://i.imgur.com/QkIa5tT.jpeg',
      creationAt: '2026-03-27T20:03:44.000Z',
      updatedAt: '2026-03-27T20:03:44.000Z',
    },
    images: [
      'https://i.imgur.com/cSytoSD.jpeg',
      'https://i.imgur.com/WwKucXb.jpeg',
      'https://i.imgur.com/cE2Dxh9.jpeg',
    ],
    creationAt: '2026-03-27T20:03:48.000Z',
    updatedAt: '2026-03-27T20:03:48.000Z',
  },
  {
    id: 646,
    title: 'Classic Heather Gray Hoodie',
    slug: 'classic-heather-gray-hoodie',
    price: 69,
    description:
      'Stay cozy and stylish with our Classic Heather Gray Hoodie. Crafted from soft, durable fabric, it features a kangaroo pocket, adjustable drawstring hood...',
    category: {
      id: 110,
      name: 'Clothes',
      slug: 'clothes',
      image: 'https://i.imgur.com/QkIa5tT.jpeg',
      creationAt: '2026-03-27T20:03:44.000Z',
      updatedAt: '2026-03-27T20:03:44.000Z',
    },
    images: [
      'https://i.imgur.com/cHddUCu.jpeg',
      'https://i.imgur.com/CFOjAgK.jpeg',
      'https://i.imgur.com/wbIMMme.jpeg',
    ],
    creationAt: '2026-03-27T20:03:49.000Z',
    updatedAt: '2026-03-27T20:03:49.000Z',
  },
  {
    id: 647,
    title: 'Classic Grey Hooded Sweatshirt',
    slug: 'classic-grey-hooded-sweatshirt',
    price: 90,
    description:
      'Elevate your casual wear with our Classic Grey Hooded Sweatshirt. Made from a soft cotton blend, this hoodie features a front kangaroo pocket...',
    category: {
      id: 110,
      name: 'Clothes',
      slug: 'clothes',
      image: 'https://i.imgur.com/QkIa5tT.jpeg',
      creationAt: '2026-03-27T20:03:44.000Z',
      updatedAt: '2026-03-27T20:03:44.000Z',
    },
    images: [
      'https://i.imgur.com/R2PN9Wq.jpeg',
      'https://i.imgur.com/IvxMPFr.jpeg',
      'https://i.imgur.com/7eW9nXP.jpeg',
    ],
    creationAt: '2026-03-27T20:03:49.000Z',
    updatedAt: '2026-03-27T20:03:49.000Z',
  },
];
