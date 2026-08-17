/* ==========================================================
   LEAFLY — SHARED PRODUCT DATA
   Single source of truth used by Shop, ProductDetail, etc.
   ========================================================== */

export type TeaCategory =
  | "Green"
  | "White"
  | "Black"
  | "Oolong"
  | "Pu-erh";

export type ProductVariantKey = "100g" | "250g";

export type ProductVariant = {
  weight: ProductVariantKey;
  price: number;
  oldPrice?: number;
};

export type Product = {
  id: number;
  name: string;
  category: TeaCategory;
  origin: string;
  caffeine: "Low" | "Medium" | "High";
  weight: string;
  price: number;
  oldPrice?: number;
  variants: {
    "100g": ProductVariant;
    "250g": ProductVariant;
  };
  badge: "Premium" | "Popular" | "Bestseller";
  image: string;
};

export const products: Product[] = [
  {
    id: 1,
    name: "Himalayan Green Tea",
    category: "Green",
    origin: "Darjeeling",
    caffeine: "Medium",
    weight: "100g",
    price: 699,
    oldPrice: 799,
    variants: {
      "100g": { weight: "100g", price: 699, oldPrice: 799 },
      "250g": { weight: "250g", price: 1549, oldPrice: 1799 },
    },
    badge: "Premium",
    image: "/leafly-green-tea.webp",
  },
  {
    id: 2,
    name: "Silver Tips White Tea",
    category: "White",
    origin: "Darjeeling",
    caffeine: "Low",
    weight: "100g",
    price: 899,
    variants: {
      "100g": { weight: "100g", price: 899 },
      "250g": { weight: "250g", price: 1999, oldPrice: 2249 },
    },
    badge: "Popular",
    image: "/leafly-white-tea.webp",
  },
  {
    id: 3,
    name: "Darjeeling First Flush",
    category: "Black",
    origin: "Darjeeling",
    caffeine: "High",
    weight: "100g",
    price: 749,
    oldPrice: 849,
    variants: {
      "100g": { weight: "100g", price: 749, oldPrice: 849 },
      "250g": { weight: "250g", price: 1649, oldPrice: 1899 },
    },
    badge: "Bestseller",
    image: "/leafly-black-tea.webp",
  },
  {
    id: 4,
    name: "Artisan Oolong",
    category: "Oolong",
    origin: "Assam",
    caffeine: "Medium",
    weight: "100g",
    price: 999,
    variants: {
      "100g": { weight: "100g", price: 999 },
      "250g": { weight: "250g", price: 2199, oldPrice: 2499 },
    },
    badge: "Premium",
    image: "/leafly-oolong-tea.webp",
  },
  {
    id: 5,
    name: "Assam Golden Black",
    category: "Black",
    origin: "Assam",
    caffeine: "High",
    weight: "100g",
    price: 649,
    variants: {
      "100g": { weight: "100g", price: 649 },
      "250g": { weight: "250g", price: 1429, oldPrice: 1629 },
    },
    badge: "Popular",
    image: "/leafly-black-tea.webp",
  },
  {
    id: 6,
    name: "Kashmir White Reserve",
    category: "White",
    origin: "Kashmir",
    caffeine: "Low",
    weight: "100g",
    price: 1199,
    variants: {
      "100g": { weight: "100g", price: 1199 },
      "250g": { weight: "250g", price: 2699, oldPrice: 2999 },
    },
    badge: "Premium",
    image: "/leafly-white-tea.webp",
  },
  {
    id: 7,
    name: "Mountain Pu-erh",
    category: "Pu-erh",
    origin: "Assam",
    caffeine: "Medium",
    weight: "100g",
    price: 1099,
    variants: {
      "100g": { weight: "100g", price: 1099 },
      "250g": { weight: "250g", price: 2449, oldPrice: 2749 },
    },
    badge: "Bestseller",
    image: "/leafly-puer-tea.webp",
  },
  {
    id: 8,
    name: "Reserve Oolong",
    category: "Oolong",
    origin: "Darjeeling",
    caffeine: "Medium",
    weight: "100g",
    price: 1299,
    oldPrice: 1499,
    variants: {
      "100g": { weight: "100g", price: 1299, oldPrice: 1499 },
      "250g": { weight: "250g", price: 2899, oldPrice: 3299 },
    },
    badge: "Premium",
    image: "/leafly-oolong-tea.webp",
  },
];
