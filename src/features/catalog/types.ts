export type GenderCategory = "infant" | "women" | "men";

export interface ProductVariant {
  id: string;
  sizeEU: number;
  stock: number;
  sku: string;
  productId: string;
}
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  priceCents: number;
  category: "INFANT" | "WOMEN" | "MEN";
  colorway?: string;
  images: string[];
  variants: ProductVariant[];
}
export interface ListResponse<T> {
  items: T[];
  total: number;
}
